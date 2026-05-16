import { useTranslation } from 'react-i18next';

export function EmailPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('pages.email')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">{t('pages.emailContent')}</p>
    </div>
  );
}
