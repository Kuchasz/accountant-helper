import { ArrowRight, FileDashed, FilePdf } from '@phosphor-icons/react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function ToolsPage() {
  const { t } = useTranslation();

  const tools = [
    {
      title: t('tools.xmlFixer'),
      description: t('tools.xmlFixerDescription'),
      icon: FileDashed,
      path: '/tools/xml-fixer',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: t('tools.pdfCompressor.title'),
      description: t('tools.pdfCompressor.description'),
      icon: FilePdf,
      path: '/tools/pdf-compressor',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('tools.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('tools.description')}</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <RouterLink
              key={tool.path}
              to={tool.path}
              className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}
              >
                <tool.icon size={24} weight="duotone" className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                {t('dashboard.seeDetails')}
                <ArrowRight size={16} className="ml-1" />
              </div>
            </RouterLink>
          ))}
        </div>
      </div>
    </div>
  );
}
