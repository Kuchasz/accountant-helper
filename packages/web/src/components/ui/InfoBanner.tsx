import { Info } from '@phosphor-icons/react';

interface InfoBannerProps {
  children: React.ReactNode;
}

export function InfoBanner({ children }: InfoBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-gray-600 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-gray-400">
      <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
      <span>{children}</span>
    </div>
  );
}
