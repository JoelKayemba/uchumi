import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import type { CurrencyOptionId } from '@/src/constants/currencies';
import type { Loan } from '@/src/types/loan';
import type { RecurringRule } from '@/src/types/recurring';
import type { Subscription } from '@/src/types/subscription';

import { suggestNextWeekCeiling } from '@/src/domain/home-insights';
import { subscriptionAmountToDisplay } from '@/src/domain/subscription-amount';
import {
  getNextBillingDate,
} from '@/src/domain/subscription-dates';

dayjs.locale('fr');

export type UpcomingRow = {
  id: string;
  title: string;
  subtitle: string;
  amountDisplay: number;
  /** Pour tri : timestamp de l’échéance (ou fin de période). */
  sortAt: number;
};

const KIND_FR: Record<RecurringRule['kind'], string> = {
  income: 'Entrée récurrente',
  expense: 'Dépense récurrente',
  savings: 'Épargne récurrente',
};

export function buildUpcomingRows(
  subscriptions: readonly Subscription[],
  recurringRules: readonly RecurringRule[],
  loans: readonly Loan[],
  displayCurrency: CurrencyOptionId,
  last7DaysOutflow: number
): { rows: UpcomingRow[]; suggestionCeiling: number } {
  const suggestionCeiling = suggestNextWeekCeiling(last7DaysOutflow);
  const rows: UpcomingRow[] = [];
  const horizon = dayjs().add(45, 'day').endOf('day');

  for (const s of subscriptions) {
    if (!s.isActive || !s.isMonthlyRecurring) continue;
    const next = getNextBillingDate(s.billingDayOfMonth).hour(12).minute(0);
    if (next.isAfter(horizon)) continue;
    const amt = subscriptionAmountToDisplay(s.amount, s.currencyId, displayCurrency);
    rows.push({
      id: `sub-${s.id}`,
      title: s.name,
      subtitle: `Prélèvement le ${next.format('D MMMM')}`,
      amountDisplay: amt,
      sortAt: next.valueOf(),
    });
  }

  for (const r of recurringRules) {
    if (!r.isActive) continue;
    if (r.kind === 'income') continue;
    const due = dayjs(r.nextDueAt).startOf('day');
    if (due.isBefore(dayjs().startOf('day'))) continue;
    if (due.isAfter(horizon)) continue;
    rows.push({
      id: `rec-${r.id}`,
      title: r.label,
      subtitle: `${KIND_FR[r.kind]} · ${due.format('dddd D MMMM')}`,
      amountDisplay: r.amountInDisplayCurrency,
      sortAt: due.valueOf(),
    });
  }

  for (const l of loans) {
    if (l.monthlyPayment <= 0) continue;
    const next = getNextBillingDate(l.debitDay).hour(12).minute(0);
    rows.push({
      id: `loan-${l.id}`,
      title: l.name,
      subtitle: `Mensualité crédit · prélèvement le ${next.format('D MMMM')}`,
      amountDisplay: l.monthlyPayment,
      sortAt: next.valueOf(),
    });
  }

  rows.sort((a, b) => a.sortAt - b.sortAt);

  return { rows, suggestionCeiling };
}
