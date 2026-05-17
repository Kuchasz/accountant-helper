import { CheckCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { getPayerStatus } from '../../lib/payerStatus';
import { trpc } from '../../lib/trpc';

export function PayersListCard() {
  const { t } = useTranslation();
  const { data: payers = [], isLoading, isError } = trpc.getPayersList.useQuery();

  const now = new Date();
  const isAfter15th = now.getDate() > 15;

  const overduePayers = isAfter15th
    ? payers.filter((p) => getPayerStatus(p.lastSentDate).color === 'red')
    : [];

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.payers.title')}
        </h3>
        {isAfter15th && !isLoading && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            {overduePayers.length} {t('dashboard.payers.overdue')}
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
      ) : !isAfter15th ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            {t('dashboard.payers.checkedAfter15')}
          </p>
        </div>
      ) : overduePayers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <CheckCircle size={32} weight="fill" className="text-green-500 dark:text-green-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('dashboard.payers.allCompliant')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {overduePayers.map((payer) => (
            <div
              key={payer.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {payer.name}
              </p>
              <span className="ml-4 flex-shrink-0 text-xs text-red-600 dark:text-red-400 font-medium">
                {payer.lastSentDate
                  ? new Intl.DateTimeFormat('pl-PL', { month: 'short', day: 'numeric' }).format(
                      new Date(payer.lastSentDate),
                    )
                  : t('dashboard.payers.noData')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

