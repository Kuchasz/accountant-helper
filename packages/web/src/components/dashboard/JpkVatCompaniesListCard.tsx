import { ScrollArea } from '@base-ui/react/scroll-area';
import { Buildings, CheckCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../lib/trpc';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function JpkVatCompaniesListCard() {
  const { t } = useTranslation();
  const { data: statuses = [], isLoading, isError } = trpc.getJpkVatDeclarationStatuses.useQuery();
  const { data: vatDueDateSetting } = trpc.getSetting.useQuery({ key: 'vat_due_date_day' });
  const vatDueDateDay = vatDueDateSetting?.value
    ? Number.parseInt(vatDueDateSetting.value) || 25
    : 25;
  const monthStatuses = statuses.filter((status) => status.sentMonth === currentMonthKey());
  const pendingCompanies = monthStatuses.filter((status) => !status.hasSent);
  const errorCount = pendingCompanies.filter((status) => status.lastError).length;
  const isAfterVatDueDate = new Date().getDate() > vatDueDateDay;
  const pendingBadgeClass = isAfterVatDueDate
    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  const latestCheckedAt = monthStatuses.reduce<Date | null>((latest, status) => {
    const checkedAt = status.checkedAt ? new Date(status.checkedAt) : null;
    if (!checkedAt || Number.isNaN(checkedAt.getTime())) {
      return latest;
    }

    return !latest || checkedAt > latest ? checkedAt : latest;
  }, null);

  return (
    <div className="lg:col-span-2 min-h-[39rem] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('dashboard.jpkVat.title')}
        </h3>
        {!isLoading && pendingCompanies.length > 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pendingBadgeClass}`}>
            {pendingCompanies.length} {t('dashboard.jpkVat.pending')}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
          {t('dashboard.jpkVat.loadError')}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {['vat-sk1', 'vat-sk2', 'vat-sk3'].map((key) => (
            <div key={key} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : pendingCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <CheckCircle size={32} weight="fill" className="text-green-500 dark:text-green-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {monthStatuses.length === 0
              ? t('dashboard.jpkVat.noChecksYet')
              : t('dashboard.jpkVat.allCompliant')}
          </p>
        </div>
      ) : (
        <>
          {errorCount > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-orange-600 dark:text-orange-400 mb-4">
              <span>{t('dashboard.jpkVat.errorHint', { count: errorCount })}</span>
              {latestCheckedAt && (
                <span className="text-gray-500 dark:text-gray-400">
                  {t('dashboard.jpkVat.lastChecked', { date: formatDate(latestCheckedAt) })}
                </span>
              )}
            </div>
          )}
          <ScrollArea.Root className="overflow-hidden">
            <ScrollArea.Viewport className="max-h-[30rem] overflow-y-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="w-[45%] text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      <div className="flex items-center space-x-1">
                        <Buildings size={14} />
                        <span>{t('dashboard.jpkVat.company')}</span>
                      </div>
                    </th>
                    <th className="w-[35%] text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      {t('dashboard.jpkVat.database')}
                    </th>
                    <th className="w-[20%] text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      {t('dashboard.jpkVat.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map((company, index) => {
                    const isLastRow = index === pendingCompanies.length - 1;
                    return (
                      <tr
                        key={`${company.companyId}-${company.sentMonth}`}
                        className={`${!isLastRow ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700`}
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {company.companyName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {company.databaseName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block max-w-full truncate whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded ${
                              company.lastError
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                : pendingBadgeClass
                            }`}
                          >
                            {company.lastError
                              ? t('dashboard.jpkVat.checkError')
                              : t('dashboard.jpkVat.notSent')}
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
        </>
      )}
    </div>
  );
}
