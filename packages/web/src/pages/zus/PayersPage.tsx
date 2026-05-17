import { Tooltip } from '@base-ui/react/tooltip';
import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import type { DataTableColumn } from '../../components/ui/DataTable';
import { DataTable } from '../../components/ui/DataTable';
import { getPayerStatus } from '../../lib/payerStatus';
import { trpc } from '../../lib/trpc';

interface Payer {
  id: number;
  name: string;
  lastSentDate: string | null;
}

const STATUS_CLASS: Record<string, string> = {
  green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

export function PayersPage() {
  const { t } = useTranslation();
  const { data: payers = [], isLoading, isError } = trpc.getPayersList.useQuery();

  const formatDate = (iso: string | null) => {
    if (!iso) return t('zus.payers.neverSent');
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  };

  const columns: DataTableColumn<Payer>[] = [
    {
      key: 'name',
      header: t('zus.payers.columns.name'),
      render: (row) => {
        const status = getPayerStatus(row.lastSentDate);
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">{row.name}</span>
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
                        <Warning size={16} weight="fill" />
                      </button>
                    )}
                  />
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded max-w-xs z-50">
                        <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                        {t('zus.payers.warningTooltip')}
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </div>
        );
      },
    },
    {
      key: 'lastSent',
      header: t('zus.payers.columns.lastSent'),
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-300">{formatDate(row.lastSentDate)}</span>
      ),
    },
    {
      key: 'status',
      header: t('zus.payers.columns.status'),
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => {
        const status = getPayerStatus(row.lastSentDate);
        const label = row.lastSentDate
          ? new Intl.DateTimeFormat('pl-PL', { month: 'short', day: 'numeric' }).format(
              new Date(row.lastSentDate),
            )
          : t('zus.payers.noData');
        return (
          <span
            className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CLASS[status.color]}`}
          >
            {label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('zus.payers.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('zus.payers.subtitle')}
          </p>
        </div>
        {!isLoading && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
            {payers.length} {t('zus.payers.total')}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">{t('zus.payers.loadError')}</p>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <DataTable<Payer>
          columns={columns}
          data={payers}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage={t('zus.payers.empty')}
        />
      </div>
    </div>
  );
}
