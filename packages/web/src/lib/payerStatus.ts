export type PayerStatusColor = 'green' | 'orange' | 'red' | 'gray';

export interface PayerStatus {
  color: PayerStatusColor;
  showWarning: boolean;
}

export function getPayerStatus(lastSentIso: string | null, dueDateDay = 20): PayerStatus {
  if (!lastSentIso) {
    // Never sent
    return { color: 'gray', showWarning: false };
  }

  const lastSentDate = new Date(lastSentIso);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const lastSentMonth = lastSentDate.getMonth();
  const lastSentYear = lastSentDate.getFullYear();

  // Sent this month → green
  const sentInCurrentMonth = lastSentMonth === currentMonth && lastSentYear === currentYear;
  if (sentInCurrentMonth) {
    return { color: 'green', showWarning: false };
  }

  // Check if sent last month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const sentInLastMonth = lastSentMonth === prevMonth && lastSentYear === prevMonthYear;

  if (sentInLastMonth) {
    // Sent last month, not sent this month
    if (currentDay <= dueDateDay) {
      // Before or at due date → orange (still time, no warning)
      return { color: 'orange', showWarning: false };
    }
    // After due date → red with warning icon
    return { color: 'red', showWarning: true };
  }

  // Not sent last month and not sent this month (more than a month ago) → gray
  return { color: 'gray', showWarning: false };
}
