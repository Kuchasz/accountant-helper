import { useTranslation } from 'react-i18next';

export function OrdersPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('pages.orders')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">{t('pages.ordersContent')}</p>
    </div>
  );
}
