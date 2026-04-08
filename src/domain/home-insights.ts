import dayjs from 'dayjs';

import type { Transaction } from '@/src/types/transaction';

import { sumByKind } from '@/src/domain/stats';

/** Fenêtre des 7 derniers jours (inclus aujourd’hui). */
export function getLast7DaysWindow() {
  const end = dayjs().endOf('day');
  const start = dayjs().subtract(6, 'day').startOf('day');
  return { start, end };
}

/** Les 7 jours précédents (avant la fenêtre « derniers 7 jours »). */
export function getPrevious7DaysWindow() {
  const end = dayjs().subtract(7, 'day').endOf('day');
  const start = dayjs().subtract(13, 'day').startOf('day');
  return { start, end };
}

export function filterTransactionsBetween(
  transactions: Transaction[],
  start: dayjs.Dayjs,
  end: dayjs.Dayjs
): Transaction[] {
  const min = start.valueOf();
  const max = end.valueOf();
  return transactions.filter((t) => {
    const v = dayjs(t.createdAt).valueOf();
    return v >= min && v <= max;
  });
}

/** Total sorties (dépenses + épargne) en devise d’affichage. */
export function totalOutflowDisplay(transactions: Transaction[]): number {
  const k = sumByKind(transactions);
  return k.expense + k.savings;
}

export type WeekTrend = {
  /** Variation en % entre la fenêtre récente et la précédente (-100 à +∞). */
  percentChange: number | null;
  direction: 'up' | 'down' | 'flat' | 'unknown';
};

export function compareWeekTrend(
  recentOutflow: number,
  previousOutflow: number
): WeekTrend {
  if (previousOutflow <= 0 && recentOutflow <= 0) {
    return { percentChange: null, direction: 'unknown' };
  }
  if (previousOutflow <= 0 && recentOutflow > 0) {
    return { percentChange: null, direction: 'up' };
  }
  const pct = ((recentOutflow - previousOutflow) / previousOutflow) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (Math.abs(pct) < 1) return { percentChange: rounded, direction: 'flat' };
  return {
    percentChange: rounded,
    direction: pct > 0 ? 'up' : 'down',
  };
}

/**
 * Proposition simple pour la semaine à venir : base sur la moyenne journalière des 7 derniers jours × 7,
 * avec une marge de 5 % (réserve).
 */
export function suggestNextWeekCeiling(recentOutflow: number): number {
  if (recentOutflow <= 0) return 0;
  const daily = recentOutflow / 7;
  return Math.round(daily * 7 * 1.05);
}
