import { Button } from '@base-ui/react/button';
import {
  ArrowCounterClockwise,
  CheckCircle,
  DownloadSimple,
  FileImage,
  FilePdf,
  SpinnerGap,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoBanner } from '../components/ui/InfoBanner';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const PUE_LIMIT = 1 * 1024 * 1024; // 1 MB
const DEBOUNCE_MS = 600;

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.bmp']);

function isImageFile(name: string): boolean {
  return IMAGE_EXTS.has(name.slice(name.lastIndexOf('.')).toLowerCase());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function qualityLabel(q: number): string {
  if (q <= 25) return 'screen';
  if (q <= 50) return 'ebook';
  if (q <= 75) return 'printer';
  return 'prepress';
}

type PreviewStage = 'idle' | 'loading' | 'done' | 'error';

interface PreviewResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
}

export function DocumentCompressorPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(50);
  const [previewStage, setPreviewStage] = useState<PreviewStage>('idle');
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState('');

  const isImage = selectedFile ? isImageFile(selectedFile.name) : false;

  // Auto-compress whenever file or quality changes
  useEffect(() => {
    if (!selectedFile) {
      setPreviewStage('idle');
      setPreviewResult(null);
      setPreviewError('');
      return;
    }

    setPreviewStage('loading');
    setPreviewResult(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const form = new FormData();
        form.append('file', selectedFile);
        form.append('quality', String(quality));

        const response = await fetch(`${API_BASE}/compress-pdf`, {
          method: 'POST',
          body: form,
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const json = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(
            json.error === 'ghostscript_not_found'
              ? t('tools.documentCompressor.error.ghostscriptNotFound')
              : t('tools.documentCompressor.error.compressionFailed'),
          );
        }

        const blob = await response.blob();
        const originalSize = Number(response.headers.get('X-Original-Size') ?? selectedFile.size);
        const compressedSize = Number(response.headers.get('X-Compressed-Size') ?? blob.size);
        const disposition = response.headers.get('Content-Disposition') ?? '';
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch?.[1] ?? `compressed_${selectedFile.name}`;

        setPreviewResult({ blob, filename, originalSize, compressedSize });
        setPreviewStage('done');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setPreviewError(
          err instanceof Error ? err.message : t('tools.documentCompressor.error.compressionFailed'),
        );
        setPreviewStage('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedFile, quality, t]);

  const handleFileChosen = (file: File) => setSelectedFile(file);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChosen(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
  };

  const handleDownload = () => {
    if (!previewResult) return;
    const url = URL.createObjectURL(previewResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = previewResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSelectedFile(null);
    setPreviewStage('idle');
    setPreviewResult(null);
    setPreviewError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compressionRatio = previewResult
    ? Math.round((1 - previewResult.compressedSize / previewResult.originalSize) * 100)
    : null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <FilePdf size={28} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.documentCompressor.title')}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {t('tools.documentCompressor.description')}
            </p>
          </div>
        </div>

        {/* PUE info banner */}
        <div className="mb-6">
          <InfoBanner>{t('tools.documentCompressor.pueInfo')}</InfoBanner>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 space-y-6">
          {/* Drop zone */}
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FilePdf size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {t('tools.documentCompressor.dropZone')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('tools.documentCompressor.acceptedFormats')}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.bmp,application/pdf,image/png,image/jpeg,image/bmp"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          ) : (
            <>
              {/* File info row */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                {isImage
                  ? <FileImage size={24} weight="duotone" className="text-blue-500 flex-shrink-0" />
                  : <FilePdf size={24} weight="duotone" className="text-blue-600 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('tools.documentCompressor.originalSize')}: {formatBytes(selectedFile.size)}
                    {selectedFile.size > PUE_LIMIT && (
                      <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Warning size={12} />
                        {t('tools.documentCompressor.tooBigForPue')}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-0 bg-transparent cursor-pointer p-1"
                  onClick={handleReset}
                >
                  {t('tools.documentCompressor.changeFile')}
                </Button>
              </div>

              {/* Quality slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tools.documentCompressor.quality')}
                  </label>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {isImage ? `${quality}% — JPEG` : `${quality}% — ${qualityLabel(quality)}`}
                  </span>
                </div>

                <div className="relative h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-150 ease-out"
                    style={{ width: `${quality}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{t('tools.documentCompressor.smallerFile')}</span>
                  <span>{t('tools.documentCompressor.betterQuality')}</span>
                </div>

                {/* Presets — PDF */}
                {!isImage && (
                  <div className="flex gap-2 flex-wrap">
                    {[15, 38, 63, 88].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setQuality(value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          qualityLabel(quality) === qualityLabel(value)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                )}

                {/* Presets — image */}
                {isImage && (
                  <div className="flex gap-2 flex-wrap">
                    {[20, 50, 75, 92].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setQuality(value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          quality === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live preview panel */}
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/50 min-h-[44px] flex items-center">
                {previewStage === 'loading' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <SpinnerGap size={16} className="animate-spin flex-shrink-0" />
                    <span>{t('tools.documentCompressor.compressing')}</span>
                  </div>
                )}

                {previewStage === 'done' && previewResult && (
                  <div className="flex items-center justify-between flex-wrap gap-2 w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('tools.documentCompressor.estimatedSize')}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                        {formatBytes(previewResult.originalSize)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatBytes(previewResult.compressedSize)}
                      </span>
                      {compressionRatio !== null && compressionRatio > 0 && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ↓ {compressionRatio}%
                        </span>
                      )}
                      {previewResult.compressedSize > PUE_LIMIT ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Warning size={11} weight="fill" />
                          {t('tools.documentCompressor.tooBigForPue')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle size={11} weight="fill" />
                          {t('tools.documentCompressor.fitsForPue')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {previewStage === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <WarningCircle size={16} className="flex-shrink-0" />
                    <span>{previewError}</span>
                  </div>
                )}

                {previewStage === 'idle' && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    {t('tools.documentCompressor.previewPending')}
                  </p>
                )}
              </div>

              {/* PUE warning when compressed file still too big */}
              {previewStage === 'done' && previewResult && previewResult.compressedSize > PUE_LIMIT && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-300">
                  <Warning size={16} className="mt-0.5 flex-shrink-0" weight="fill" />
                  <span>{t('tools.documentCompressor.stillTooBigForPue')}</span>
                </div>
              )}

              {/* Download + reset */}
              <div className="flex gap-3">
                <Button
                  disabled={previewStage !== 'done'}
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0 hover:opacity-90 transition-opacity"
                >
                  {previewStage === 'loading' ? (
                    <>
                      <SpinnerGap size={18} className="animate-spin" />
                      {t('tools.documentCompressor.compressing')}
                    </>
                  ) : (
                    <>
                      <DownloadSimple size={18} />
                      {t('tools.documentCompressor.download')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm cursor-pointer bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowCounterClockwise size={18} />
                  {t('tools.documentCompressor.compressAnother')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
