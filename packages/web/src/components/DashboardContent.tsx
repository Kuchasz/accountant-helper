import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { Tooltip } from '@base-ui/react/tooltip';
import { CaretDown, Funnel, Gear, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConversionCard } from './dashboard/ConversionCard';
import { TopProductsCard } from './dashboard/TopProductsCard';
import { TotalVisitsCard } from './dashboard/TotalVisitsCard';

export function DashboardContent() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(t('dashboard.thisYear'));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Popover.Root>
            <Popover.Trigger
              render={(props) => (
                <Button
                  {...props}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2 bg-white dark:bg-gray-900 cursor-pointer"
                >
                  <Funnel size={16} />
                  <span>{t('dashboard.filters')}</span>
                </Button>
              )}
            />
            <Popover.Portal>
              <Popover.Positioner sideOffset={8}>
                <Popover.Popup className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] z-50">
                  <Popover.Arrow className="fill-white dark:fill-gray-800" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('dashboard.filterOptions')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('dashboard.comingSoon')}
                    </p>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
          <Button className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center space-x-2 border-0 cursor-pointer">
            <Plus size={16} weight="bold" />
            <span>{t('dashboard.addWidget')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Product Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.productOverview')}
            </h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                      {t('common.settings')}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">$43,630</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('dashboard.totalSales')}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboard.selectByProduct')}
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg flex items-center space-x-1">
                <span>{t('dashboard.cosmetics')}</span>
                <span className="ml-1 px-1.5 py-0.5 bg-orange-200 rounded">8</span>
              </span>
              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg flex items-center space-x-1">
                <span>{t('dashboard.hqSweeds')}</span>
                <span className="ml-1 px-1.5 py-0.5 bg-orange-200 rounded">8</span>
              </span>
            </div>
          </div>
        </div>

        {/* Active Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.activeSales')}
            </h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                      {t('common.settings')}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">$27,064</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.vsLastMonth')}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                +12%
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between h-20">
            {[40, 60, 35, 70, 45, 85, 50].map((height, index) => (
              <div key={`sales-bar-${height}-${index}`} className="flex-1 mx-0.5">
                <div
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <Button className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center border-0 bg-transparent p-0 cursor-pointer">
            {t('dashboard.seeDetails')}
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
        </div>

        {/* Product Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.productRevenue')}
            </h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                      {t('common.settings')}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">$16,568</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.vsLastMonth')}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                -7%
              </span>
            </div>
          </div>
          <div className="relative w-24 h-24 mx-auto">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label="Revenue chart"
            >
              <title>Product Revenue Chart</title>
              <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#fb923c"
                strokeWidth="12"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <Button className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center border-0 bg-transparent p-0 cursor-pointer">
            {t('dashboard.seeDetails')}
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('dashboard.analytics')}
            </h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                      Settings
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">-$4.5430</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.sales')}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                -8.04%
              </span>
            </div>
          </div>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end justify-between">
              {[30, 25, 35, 28, 40, 75, 45, 35, 30, 40, 35, 38].map((height, index) => (
                <div
                  key={`analytics-bar-${height}-${index}`}
                  className="flex-1 mx-1 relative group"
                >
                  <div
                    className="bg-orange-200 rounded-t relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-orange-400 to-orange-300"
                      style={{
                        clipPath: 'polygon(0 20%, 100% 10%, 100% 100%, 0% 100%)',
                      }}
                    />
                  </div>
                  {index === 5 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                      -18%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{t('dashboard.jan')}</span>
            <span>{t('dashboard.feb')}</span>
            <span>{t('dashboard.mar')}</span>
            <span>{t('dashboard.apr')}</span>
            <span>{t('dashboard.may')}</span>
            <span>{t('dashboard.jun')}</span>
            <span>{t('dashboard.jul')}</span>
            <span>{t('dashboard.aug')}</span>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('dashboard.salesPerformance')}
            </h3>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <Gear size={16} />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      {t('common.settings')}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="flex items-center justify-between mb-4">
            <Select.Root
              value={selectedYear}
              onValueChange={(value) => value && setSelectedYear(value[0])}
            >
              <Select.Trigger className="text-sm text-gray-600 border-0 bg-transparent p-0 cursor-pointer flex items-center space-x-1">
                <Select.Value placeholder={t('dashboard.selectYear')}>{selectedYear}</Select.Value>
                <CaretDown size={16} className="text-gray-400" />
              </Select.Trigger>
              <Select.Positioner sideOffset={8}>
                <Select.Popup className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[140px] z-50">
                  <Select.Item
                    value="This year"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>{t('dashboard.thisYear')}</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="Last year"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>{t('dashboard.lastYear')}</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="Last 6 months"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Select.ItemText>{t('dashboard.last6Months')}</Select.ItemText>
                  </Select.Item>
                </Select.Popup>
              </Select.Positioner>
            </Select.Root>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="p-1.5 hover:bg-gray-100 rounded border-0 bg-transparent cursor-pointer"
                    >
                      <Funnel size={16} className="text-gray-400" />
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={4}>
                    <Tooltip.Popup className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      <Tooltip.Arrow className="fill-gray-900" />
                      {t('dashboard.filter')}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label="Sales performance"
            >
              <title>Sales Performance Chart</title>
              <circle cx="50" cy="50" r="35" stroke="#f3f4f6" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#fb923c"
                strokeWidth="8"
                fill="none"
                strokeDasharray="219.8"
                strokeDashoffset="180"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#fed7aa"
                strokeWidth="2"
                fill="none"
                strokeDasharray="263.8"
                strokeDashoffset="200"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900">17.9%</div>
              <div className="text-xs text-gray-500 mt-1">{t('dashboard.sinceYesterday')}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-orange-500 rounded" />
                <span className="text-gray-600">{t('dashboard.totalSalesPerDay')}</span>
              </div>
              <span className="font-medium text-gray-900">{t('dashboard.forWeek')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-orange-200 rounded" />
                <span className="text-gray-600">{t('dashboard.averageSales')}</span>
              </div>
              <span className="font-medium text-gray-900">{t('dashboard.forToday')}</span>
            </div>
          </div>
          <Button className="mt-4 w-full text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center border-0 bg-transparent cursor-pointer">
            {t('dashboard.seeDetails')}
            <CaretDown size={16} className="ml-1 -rotate-90" />
          </Button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion & Total Visits */}
        <div className="space-y-6">
          <ConversionCard />
          <TotalVisitsCard />
        </div>

        <TopProductsCard />
      </div>
    </div>
  );
}
