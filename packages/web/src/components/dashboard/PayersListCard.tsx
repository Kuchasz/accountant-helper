import { CheckCircle, User } from '@phosphor-icons/react';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { useTranslation } from 'react-i18next';
import { getPayerStatus } from '../../lib/payerStatus';
import { trpc } from '../../lib/trpc';

const ROW_BADGE_CLASS: Record<string, string> = {
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export function PayersListCard() {
  const { t } = useTranslation();
  const { data: payers = [], isLoading, isError } = trpc.getPayersList.useQuery();
  const { data: dueDateSetting } = trpc.getSetting.useQuery({ key: 'zus_due_date_day' });
  const dueDateDay = dueDateSetting?.value ? Number.parseInt(dueDateSetting.value) || 20 : 20;

  const pendingPayers = payers.filter((p) => {
    const { color } = getPayerStatus(p.lastSentDate, dueDateDay);
    return color === 'orange' || color === 'red';
  });

  const overdueCount = pendingPayers.filter(
    (p) => getPayerStatus(p.lastSentDate, dueDateDay).color === 'red',
  ).length;

  const headerBadgeClass =
    overdueCount > 0
      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.payers.title')}
        </h3>
        {!isLoading && pendingPayers.length > 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${headerBadgeClass}`}>
            {pendingPayers.length} {t('dashboard.payers.pending')}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
          {t('dashboard.payers.loadError')}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {['sk1', 'sk2', 'sk3'].map((k) => (
            <div key={k} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : pendingPayers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <CheckCircle size={32} weight="fill" className="text-green-500 dark:text-green-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('dashboard.payers.allCompliant')}
          </p>
        </div>
      ) : (
        <ScrollArea.Root className="overflow-hidden">
          <ScrollArea.Viewport className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{t('zus.payers.columns.name')}</span>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    {t('zus.payers.columns.lastSent')}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    {t('zus.payers.columns.declarationStatus')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingPayers.map((payer, index) => {
                  const statusColor = getPayerStatus(payer.lastSentDate, dueDateDay).color as 'orange' | 'red';
                  const isLastRow = index === pendingPayers.length - 1;
                  return (
                    <tr
                      key={payer.id}
                      className={`${!isLastRow ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700`}
                    >
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {payer.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {payer.lastSentDate
                            ? new Intl.DateTimeFormat('pl-PL', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }).format(new Date(payer.lastSentDate))
                            : t('dashboard.payers.noData')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded ${ROW_BADGE_CLASS[statusColor]}`}
                        >
                          {statusColor === 'red' ? t('dashboard.payers.overdue') : t('dashboard.payers.pending')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            className="flex w-2 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-400 dark:bg-gray-600 rounded-full hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      )}
    </div>
  );
}

