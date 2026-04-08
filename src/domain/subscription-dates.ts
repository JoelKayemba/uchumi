import dayjs from 'dayjs';

/** Prochaine date d’échéance (jour du mois, max 28). */
export function getNextBillingDate(billingDayOfMonth: number): dayjs.Dayjs {
  const d = Math.min(Math.max(1, billingDayOfMonth), 28);
  const today = dayjs().startOf('day');
  let thisMonth = today.date(d);
  if (thisMonth.isBefore(today, 'day')) {
    return today.add(1, 'month').date(d).startOf('day');
  }
  return thisMonth;
}

export function isBillingDayToday(billingDayOfMonth: number): boolean {
  const d = Math.min(Math.max(1, billingDayOfMonth), 28);
  return dayjs().date() === d;
}

export function currentMonthKey(): string {
  return dayjs().format('YYYY-MM');
}

export function daysUntilNextBilling(billingDayOfMonth: number): number {
  const next = getNextBillingDate(billingDayOfMonth);
  return next.diff(dayjs().startOf('day'), 'day');
}
