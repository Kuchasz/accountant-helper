import { Tooltip } from '@base-ui/react/tooltip';
import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../lib/trpc';

// Helper function to determine status based on last sent ISO date string
function getPayerStatus(lastSentIso: string | null): {
  color: 'green' | 'yellow' | 'red' | 'gray';
  showWarning: boolean;
} {
  if (!lastSentIso) {
    return { color: 'gray', showWarning: false };
  }

  const lastSentDate = new Date(lastSentIso);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const lastSentMonth = lastSentDate.getMonth();
  const lastSentYear = lastSentDate.getFullYear();

  const sentInCurrentMonth = lastSentMonth === currentMonth && lastSentYear === currentYear;

  if (sentInCurrentMonth) {
    return { color: 'green', showWarning: false };
  }

  if (currentDay > 15) {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const sentInLastMonth = lastSentMonth === lastMonth && lastSentYear === lastMonthYear;
    return { color: 'red', showWarning: sentInLastMonth };
  }

  return { color: 'yellow', showWarning: false };
}

export function PayersListCard() {
  const { t } = useTranslation();
  const { data: payers = [], isLoading, isError } = trpc.getPayersList.useQuery();

  const formatDate = (iso: string | null) => {
    if (!iso) return t('dashboard.payers.neverSent');
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.payers.title')}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isLoading ? '…' : payers.length} {t('dashboard.payers.total')}
        </span>
      </div>

      {isError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
          {t('dashboard.payers.loadError')}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {['sk1','sk2','sk3','sk4','sk5','sk6'].map((k) => (
            <div key={k} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
      <div className="overflow-y-auto max-h-96">
        <div className="space-y-2">
          {payers.map((payer) => {
            const status = getPayerStatus(payer.lastSentDate);

            return (
              <div
                key={payer.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {payer.name}
                      </p>
                      {status.showWarning && (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger
                              render={(props) => (
                                <button
                                  {...props}
                                  type="button"
                                  className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 border-0 bg-transparent p-0 cursor-pointer"
                                >
                                  <Warning size={18} weight="fill" />
                                </button>
                              )}
                            />
                            <Tooltip.Portal>
                              <Tooltip.Positioner sideOffset={4}>
                                <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded max-w-xs z-50">
                                  <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                                  {t('dashboard.payers.warning')}
                                </Tooltip.Popup>
                              </Tooltip.Positioner>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('dashboard.payers.lastSent')}: {formatDate(payer.lastSentDate)}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <span
                    className={`
                      px-3 py-1 text-xs font-medium rounded-full
                      ${
                        status.color === 'green'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : status.color === 'yellow'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : status.color === 'gray'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }
                    `}
                  >
                    {payer.lastSentDate
                      ? new Intl.DateTimeFormat('pl-PL', {
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(payer.lastSentDate))
                      : t('dashboard.payers.noData')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
