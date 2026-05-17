import { useTranslation } from 'react-i18next';
import { trpc } from '../../lib/trpc';

const CIRCUMFERENCE = 251.2; // 2π × 40

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getArcColor(percent: number): string {
  if (percent >= 80) return '#22c55e';
  if (percent >= 50) return '#f59e0b';
  return '#ef4444';
}

export function JpkVatDeclarationsCard() {
  const { t } = useTranslation();
  const { data: statuses = [], isLoading } = trpc.getJpkVatDeclarationStatuses.useQuery();
  const { data: vatDueDateSetting } = trpc.getSetting.useQuery({ key: 'vat_due_date_day' });
  const vatDueDateDay = vatDueDateSetting?.value
    ? Number.parseInt(vatDueDateSetting.value) || 25
    : 25;
  const monthStatuses = statuses.filter((status) => status.sentMonth === currentMonthKey());

  const total = monthStatuses.length;
  const sentCount = monthStatuses.filter((status) => status.hasSent).length;
  const errorCount = monthStatuses.filter((status) => status.lastError).length;
  const pendingCount = total - sentCount;
  const isAfterVatDueDate = new Date().getDate() > vatDueDateDay;
  const percent = total > 0 ? Math.round((sentCount / total) * 100) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percent / 100);
  const arcColor = getArcColor(percent);

  return (
    <div className="min-h-[39rem] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
        {t('dashboard.jpkVatDeclarations.title')}
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <div className="w-36 h-36 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : (
          <div className="relative w-36 h-36">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label={t('dashboard.jpkVatDeclarations.title')}
            >
              <title>{t('dashboard.jpkVatDeclarations.title')}</title>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f3f4f6"
                strokeWidth="12"
                fill="none"
                className="dark:stroke-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={arcColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {percent}%
              </span>
            </div>
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isLoading ? (
              <span className="inline-block w-20 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            ) : (
              <>
                {sentCount}{' '}
                <span className="text-gray-500 dark:text-gray-400 font-normal">
                  {t('dashboard.jpkVatDeclarations.of')} {total}
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.jpkVatDeclarations.subtitle')}
          </p>
        </div>

        <div className="w-full space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.jpkVatDeclarations.sent')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : sentCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  isAfterVatDueDate ? 'bg-red-400' : 'bg-orange-400'
                }`}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.jpkVatDeclarations.pending')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : pendingCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.jpkVatDeclarations.errors')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : errorCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
