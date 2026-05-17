import { Button } from '@base-ui/react/button';
import { CheckCircle, DownloadSimple, FileDashed, Upload, Warning } from '@phosphor-icons/react';
import JSZip from 'jszip';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoBanner } from '../components/ui/InfoBanner';

type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

interface ProcessResult {
  filename: string;
  xmlContent: string;
}

export function XmlFixerPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const clearTags = (xmlDoc: Document): Document => {
    // Clear BAZA_ZRD_ID tags
    const bazaZrdIdElements = xmlDoc.getElementsByTagName('BAZA_ZRD_ID');
    for (let i = 0; i < bazaZrdIdElements.length; i++) {
      bazaZrdIdElements[i].textContent = '';
    }

    // Clear BAZA_DOC_ID tags
    const bazaDocIdElements = xmlDoc.getElementsByTagName('BAZA_DOC_ID');
    for (let i = 0; i < bazaDocIdElements.length; i++) {
      bazaDocIdElements[i].textContent = '';
    }

    return xmlDoc;
  };

  const processXmlContent = async (content: string, filename: string): Promise<ProcessResult> => {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(t('tools.error.invalidXml'));
    }

    // Clear the tags
    const cleanedDoc = clearTags(xmlDoc);

    // Serialize back to string
    const serializer = new XMLSerializer();
    const cleanedXml = serializer.serializeToString(cleanedDoc);

    // Add language-specific prefix to filename
    const prefix = t('tools.filePrefix');
    const newFilename = `${prefix}${filename}`;

    return {
      filename: newFilename,
      xmlContent: cleanedXml,
    };
  };

  const processFile = async (file: File) => {
    setState('processing');
    setError('');
    setResult(null);

    try {
      const isZip =
        file.name.endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed';

      if (isZip) {
        // Handle ZIP file
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);

        // Find XML files in the ZIP
        const xmlFiles = Object.keys(zipContent.files).filter(
          (filename) =>
            (filename.endsWith('.xml') || filename.endsWith('.XML')) &&
            !zipContent.files[filename].dir,
        );

        if (xmlFiles.length === 0) {
          throw new Error(t('tools.error.noXmlInZip'));
        }

        if (xmlFiles.length > 1) {
          throw new Error(t('tools.error.multipleXmlInZip'));
        }

        // Extract the single XML file
        const xmlFilename = xmlFiles[0];
        const xmlContent = await zipContent.files[xmlFilename].async('string');

        // Process the XML
        const processResult = await processXmlContent(
          xmlContent,
          xmlFilename.split('/').pop() || 'document.xml',
        );
        setResult(processResult);
        setState('success');
      } else if (file.name.endsWith('.xml') || file.name.endsWith('.XML')) {
        // Handle XML file
        const content = await file.text();
        const processResult = await processXmlContent(content, file.name);
        setResult(processResult);
        setState('success');
      } else {
        throw new Error(t('tools.error.invalidFile'));
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : t('tools.error.readError'));
      setState('error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setState('idle');
    setError('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <FileDashed size={28} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('tools.xmlFixer')}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('tools.xmlFixerDescription')}</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6">
          <InfoBanner>{t('tools.uploadDescription')}</InfoBanner>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
          {state === 'idle' || state === 'processing' ? (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${state === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center space-y-4">
                  {state === 'processing' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
                        <FileDashed size={32} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t('tools.processing')}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Upload size={32} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {t('tools.dropZone')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('tools.acceptedFormats')}
                        </p>
                      </div>
                      <Button
                        onClick={handleBrowseClick}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors border-0 cursor-pointer"
                      >
                        {t('tools.upload')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.zip,application/xml,text/xml,application/zip,application/x-zip-compressed"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          ) : state === 'success' && result ? (
            <>
              {/* Success State */}
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle
                      size={32}
                      weight="fill"
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('tools.success')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.successMessage')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleDownload}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors border-0 cursor-pointer inline-flex items-center justify-center"
                  >
                    <DownloadSimple size={20} className="mr-2" />
                    {t('tools.download')}
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors border-0 cursor-pointer"
                  >
                    {t('tools.downloadAnother')}
                  </Button>
                </div>
              </div>
            </>
          ) : state === 'error' ? (
            <>
              {/* Error State */}
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Warning size={32} weight="fill" className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('tools.error.title')}
                  </h3>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
                <Button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors border-0 cursor-pointer"
                >
                  {t('tools.downloadAnother')}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
