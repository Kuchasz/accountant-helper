import 'reflect-metadata';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import { initializeDatabase } from './db';
import { appRouter } from './router';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

bootstrap();
