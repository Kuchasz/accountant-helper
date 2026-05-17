export type PayerStatusColor = 'green' | 'yellow' | 'red' | 'gray';

export interface PayerStatus {
  color: PayerStatusColor;
  showWarning: boolean;
}

export function getPayerStatus(lastSentIso: string | null): PayerStatus {
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
