import { CaretDown, TrendUp } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export function ConversionCard() {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.thisYear')}
        </h3>
        <CaretDown size={16} className="text-gray-400 dark:text-gray-500" />
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">0.73%</div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.convrate')}
          </span>
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded flex items-center">
            <TrendUp size={12} className="mr-1" />
            +1.9%
          </span>
        </div>
      </div>
    </div>
  );
}
