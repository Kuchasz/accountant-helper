import 'reflect-metadata';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import multer from 'multer';
import sharp from 'sharp';
import { initializeDatabase } from './db/index.js';
import { startJobScheduler } from './jobs/index.js';
import { appRouter } from './router.js';

const execFileAsync = promisify(execFile);

const app = express();
const port = process.env.PORT || 3000;
let jobScheduler: ReturnType<typeof startJobScheduler> | null = null;

app.use(cors());
app.use(express.json());

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.bmp']);
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/bmp', 'image/x-bmp', 'image/x-ms-bmp']);

function isImageFile(mimetype: string, originalname: string): boolean {
  const ext = path.extname(originalname).toLowerCase();
  return IMAGE_MIMES.has(mimetype) || IMAGE_EXTS.has(ext);
}

// PDF + image upload (memory storage, max 50MB)
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      file.mimetype === 'application/pdf' ||
      ext === '.pdf' ||
      isImageFile(file.mimetype, file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPEG, and BMP files are accepted'));
    }
  },
});

// Quality level → Ghostscript settings
function gsSettingsForQuality(quality: number): { dpi: number; setting: string } {
  if (quality <= 25) return { dpi: 72, setting: '/screen' };
  if (quality <= 50) return { dpi: 96, setting: '/ebook' };
  if (quality <= 75) return { dpi: 150, setting: '/printer' };
  return { dpi: 300, setting: '/prepress' };
}

// POST /compress-pdf
// Body: multipart/form-data { file: PDF|PNG|JPEG|BMP, quality: 1-100 }
app.post('/compress-pdf', pdfUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const quality = Math.min(100, Math.max(1, Number(req.body.quality) || 50));

    // --- Image path (PNG / JPEG / BMP → JPEG) ---
    if (isImageFile(req.file.mimetype, req.file.originalname)) {
      const compressed = await sharp(req.file.buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      const originalName = req.file.originalname.replace(/\.(png|jpg|jpeg|bmp)$/i, '');
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="compressed_${originalName}.jpg"`,
        'X-Original-Size': String(req.file.size),
        'X-Compressed-Size': String(compressed.length),
      });
      res.send(compressed);
      return;
    }

    // --- PDF path (Ghostscript) ---
    const { dpi, setting } = gsSettingsForQuality(quality);
    const tmpDir = await mkdtemp(path.join(tmpdir(), 'pdf-compress-'));
    const inputPath = path.join(tmpDir, 'input.pdf');
    const outputPath = path.join(tmpDir, 'output.pdf');

    try {
      await writeFile(inputPath, req.file.buffer);

      await execFileAsync('gs', [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${setting}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dDetectDuplicateImages=true',
        '-dCompressFonts=true',
        `-dColorImageResolution=${dpi}`,
        `-dGrayImageResolution=${dpi}`,
        `-dMonoImageResolution=${dpi}`,
        `-sOutputFile=${outputPath}`,
        inputPath,
      ]);

      const compressed = await readFile(outputPath);
      const originalName = req.file.originalname.replace(/\.pdf$/i, '');

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed_${originalName}.pdf"`,
        'X-Original-Size': String(req.file.size),
        'X-Compressed-Size': String(compressed.length),
      });
      res.send(compressed);
    } finally {
      await Promise.allSettled([unlink(inputPath), unlink(outputPath)]);
    }
  } catch (err) {
    console.error('Compression error:', err);
    if (err instanceof Error && err.message.includes('gs')) {
      res.status(500).json({ error: 'ghostscript_not_found' });
    } else {
      res.status(500).json({ error: 'compression_failed' });
    }
  }
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    onError: ({ path, error }) => {
      console.error(`❌ tRPC Error on ${path ?? 'unknown'}:`);
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      if (error.cause) {
        console.error('  Cause:', error.cause);
      }
      console.error('  Stack:', error.stack);
    },
  }),
);

// Initialize database and start server
async function bootstrap() {
  try {
    await initializeDatabase();
    jobScheduler = startJobScheduler();

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

function shutdown(signal: NodeJS.Signals): void {
  console.log(`Received ${signal}, shutting down jobs`);
  jobScheduler?.stop();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

bootstrap();
