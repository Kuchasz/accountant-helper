import { useTranslation } from 'react-i18next';

export function ProductsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('pages.products')}</h1>
      <p className="text-gray-600 dark:text-gray-400">{t('pages.productsContent')}</p>
    </div>
  );
}
