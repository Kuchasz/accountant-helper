import { Tabs } from '@base-ui/react/tabs';
import { Tooltip } from '@base-ui/react/tooltip';
import { Warning } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataTableColumn } from '../../components/ui/DataTable';
import { DataTable } from '../../components/ui/DataTable';
import { trpc } from '../../lib/trpc';

type FilterTab = 'all' | 'upo-received' | 'sent' | 'not-sent' | 'errors';

interface VatDeclarationStatus {
  id: number;
  companyId: number;
  companyName: string;
  databaseName: string;
  sentMonth: string;
  hasSent: boolean;
  deliveryStatus?: 'sent' | 'upo_received' | null;
  sentAt?: string | Date | null;
  checkedAt?: string | Date | null;
  lastError?: string | null;
  statusDescription?: string | null;
  referenceNumber?: string | null;
}

const STATUS_CLASS = {
  sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  upo_received: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  error: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(value: string | Date | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function VatDeclarationsPage() {
  const { t } = useTranslation();
  const { data: statuses = [], isLoading, isError } = trpc.getJpkVatDeclarationStatuses.useQuery();
  const { data: vatDueDateSetting } = trpc.getSetting.useQuery({ key: 'vat_due_date_day' });
  const vatDueDateDay = vatDueDateSetting?.value
    ? Number.parseInt(vatDueDateSetting.value) || 25
    : 25;
  const isAfterVatDueDate = new Date().getDate() > vatDueDateDay;
  const monthStatuses = statuses.filter((status) => status.sentMonth === currentMonthKey());

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filterCounts = {
    upoReceived: monthStatuses.filter((status) => status.deliveryStatus === 'upo_received').length,
    sent: monthStatuses.filter((status) => status.deliveryStatus === 'sent').length,
    'not-sent': monthStatuses.filter((status) => !status.hasSent && !status.lastError).length,
    errors: monthStatuses.filter((status) => status.lastError).length,
  };

  const filteredStatuses = monthStatuses.filter((status) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upo-received') return status.deliveryStatus === 'upo_received';
    if (activeFilter === 'sent') return status.deliveryStatus === 'sent';
    if (activeFilter === 'not-sent') return !status.hasSent && !status.lastError;
    return Boolean(status.lastError);
  });

  const filterTabs: { value: FilterTab; labelKey: string; count: number }[] = [
    { value: 'all', labelKey: 'optima.vatDeclarations.filter.all', count: monthStatuses.length },
    {
      value: 'upo-received',
      labelKey: 'optima.vatDeclarations.filter.upoReceived',
      count: filterCounts.upoReceived,
    },
    { value: 'sent', labelKey: 'optima.vatDeclarations.filter.sent', count: filterCounts.sent },
    {
      value: 'not-sent',
      labelKey: 'optima.vatDeclarations.filter.notSent',
      count: filterCounts['not-sent'],
    },
    {
      value: 'errors',
      labelKey: 'optima.vatDeclarations.filter.errors',
      count: filterCounts.errors,
    },
  ];

  const columns: DataTableColumn<VatDeclarationStatus>[] = [
    {
      key: 'companyName',
      header: t('optima.vatDeclarations.columns.companyName'),
      sortable: true,
      sortValue: (row) => row.companyName,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.companyName}</span>
          {row.lastError && (
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
                      {row.lastError}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      ),
    },
    {
      key: 'databaseName',
      header: t('optima.vatDeclarations.columns.databaseName'),
      className: 'w-64 max-w-64',
      headerClassName: 'w-64 max-w-64',
      sortable: true,
      sortValue: (row) => row.databaseName,
      render: (row) => (
        <span
          className="block max-w-64 truncate whitespace-nowrap text-gray-600 dark:text-gray-300"
          title={row.databaseName}
        >
          {row.databaseName}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: t('optima.vatDeclarations.columns.sentAt'),
      sortable: true,
      sortValue: (row) => (row.sentAt ? new Date(row.sentAt).getTime() : null),
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(row.sentAt, t('optima.vatDeclarations.notSent'))}
        </span>
      ),
    },
    {
      key: 'checkedAt',
      header: t('optima.vatDeclarations.columns.checkedAt'),
      sortable: true,
      sortValue: (row) => (row.checkedAt ? new Date(row.checkedAt).getTime() : null),
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(row.checkedAt, t('optima.vatDeclarations.notChecked'))}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('optima.vatDeclarations.columns.status'),
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => {
        const statusKey = row.lastError
          ? 'error'
          : row.hasSent
            ? row.deliveryStatus === 'upo_received'
              ? 'upo_received'
              : 'sent'
            : isAfterVatDueDate
              ? 'overdue'
              : 'pending';

        return (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={(props) => (
                  <span
                    {...props}
                    className={`inline-block max-w-40 truncate px-2.5 py-1 text-xs font-medium rounded-full cursor-default ${STATUS_CLASS[statusKey]}`}
                  >
                    {t(`optima.vatDeclarations.status.${statusKey}`)}
                  </span>
                )}
              />
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded max-w-xs z-50">
                    <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                    {row.lastError ||
                      row.statusDescription ||
                      t(`optima.vatDeclarations.statusTooltip.${statusKey}`)}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('optima.vatDeclarations.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('optima.vatDeclarations.subtitle')}
          </p>
        </div>
        {!isLoading && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
            {filteredStatuses.length}
            {activeFilter !== 'all' ? `/${monthStatuses.length}` : ''}{' '}
            {t('optima.vatDeclarations.total')}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
          {t('optima.vatDeclarations.loadError')}
        </p>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs.Root value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
          <Tabs.List className="relative flex border-b border-gray-200 dark:border-gray-700">
            {filterTabs.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 data-[active]:text-gray-900 dark:data-[active]:text-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
              >
                {t(tab.labelKey)}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                    activeFilter === tab.value
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="absolute bottom-0 left-0 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-200 ease-in-out" />
          </Tabs.List>
        </Tabs.Root>

        <DataTable<VatDeclarationStatus>
          columns={columns}
          data={filteredStatuses}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage={t('optima.vatDeclarations.empty')}
        />
      </div>
    </div>
  );
}
