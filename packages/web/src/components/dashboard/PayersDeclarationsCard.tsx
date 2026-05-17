import { useTranslation } from 'react-i18next';
import { getPayerStatus } from '../../lib/payerStatus';
import { trpc } from '../../lib/trpc';

const CIRCUMFERENCE = 251.2; // 2π × 40

function getArcColor(percent: number): string {
  if (percent >= 80) return '#22c55e'; // green-500
  if (percent >= 50) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
}

export function PayersDeclarationsCard() {
  const { t } = useTranslation();
  const { data: payers = [], isLoading } = trpc.getPayersList.useQuery();
  const { data: dueDateSetting } = trpc.getSetting.useQuery({ key: 'zus_due_date_day' });
  const dueDateDay = dueDateSetting?.value ? Number.parseInt(dueDateSetting.value) || 20 : 20;

  const total = payers.length;
  const sentCount = payers.filter((p) => getPayerStatus(p.lastSentDate, dueDateDay).color === 'green').length;
  const notSubmittedCount = payers.filter((p) => {
    const { color } = getPayerStatus(p.lastSentDate, dueDateDay);
    return color === 'orange' || color === 'red';
  }).length;
  const ignoredCount = total - sentCount - notSubmittedCount;
  const activeCount = sentCount + notSubmittedCount;
  const percent = activeCount > 0 ? Math.round((sentCount / activeCount) * 100) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percent / 100);
  const arcColor = getArcColor(percent);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
        {t('dashboard.payersDeclarations.title')}
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <div className="w-36 h-36 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : (
          <div className="relative w-36 h-36">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-label={t('dashboard.payersDeclarations.title')}
            >
              <title>{t('dashboard.payersDeclarations.title')}</title>
              <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
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
                  {t('dashboard.payersDeclarations.of')} {activeCount}
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.payersDeclarations.subtitle')}
          </p>
        </div>

        <div className="w-full space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.payersDeclarations.sent')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : sentCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.payersDeclarations.pending')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : notSubmittedCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.payersDeclarations.ignored')}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? '…' : ignoredCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
