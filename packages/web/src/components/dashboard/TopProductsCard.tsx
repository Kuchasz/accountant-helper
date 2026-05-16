import { Button } from '@base-ui/react/button';
import { CaretDown, Package, ShoppingBag } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export function TopProductsCard() {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.topProducts')}
        </h3>
        <Button className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center border-0 bg-transparent p-0 cursor-pointer">
          {t('dashboard.seeDetails')}
          <CaretDown size={16} className="ml-1 -rotate-90" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                <div className="flex items-center space-x-1">
                  <Package size={14} />
                  <span>{t('dashboard.product')}</span>
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('dashboard.sales')}
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('dashboard.revenue')}
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('dashboard.stock')}
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('dashboard.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded flex items-center justify-center">
                    <ShoppingBag size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Bled Shorts
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Instagram Inves...
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">127</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.pcs')}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">$1,890</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">100</div>
              </td>
              <td className="py-4 px-4">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                  {t('dashboard.inStock')}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded flex items-center justify-center">
                    <ShoppingBag size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      T Shirts - Me
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Instagram Inves...
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">540</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.pcs')}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">$2,819</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">100</div>
              </td>
              <td className="py-4 px-4">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                  {t('dashboard.outOfStock')}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
