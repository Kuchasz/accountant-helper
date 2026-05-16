import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import { Gear } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export function TotalVisitsCard() {
  const { t } = useTranslation();
  const weekdays = [t('dashboard.mon'), t('dashboard.tue'), t('dashboard.wed')];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.totalVisitsByHourly')}
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
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">288,142</div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded">
            -2.9%
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        {weekdays.map((day, index) => (
          <div key={day} className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{day}</span>
            <div className="flex-1">
              <div
                className={`h-6 rounded ${
                  index === 1
                    ? 'bg-orange-500 dark:bg-orange-400'
                    : 'bg-orange-200 dark:bg-orange-900/50'
                }`}
                style={{ width: `${[70, 90, 45][index]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
