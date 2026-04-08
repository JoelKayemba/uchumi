import dayjs from 'dayjs';

import type { Transaction } from '@/src/types/transaction';

export type DailyPoint = {
  /** Indice jour (1..n) */
  label: string;
  /** Sorties (dépenses + épargne) ce jour-là, devise affichage */
  value: number;
};

/**
 * Série jour par jour sur le mois civil courant (jusqu’à aujourd’hui si mois en cours).
 */
export function monthDailyOutflow(transactions: Transaction[]): DailyPoint[] {
  const now = dayjs();
  const start = now.startOf('month');
  const end = now.endOf('month');
  const today = now.endOf('day');
  const lastDay = end.isBefore(today) ? end : today;

  const points: DailyPoint[] = [];
  let cursor = start;
  while (!cursor.isAfter(lastDay, 'day')) {
    const d0 = cursor.startOf('day').valueOf();
    const d1 = cursor.endOf('day').valueOf();
    let out = 0;
    for (const t of transactions) {
      const ts = dayjs(t.createdAt).valueOf();
      if (ts < d0 || ts > d1) continue;
      if (t.kind === 'expense' || t.kind === 'savings') {
        out += t.amountInDisplayCurrency;
      }
    }
    points.push({
      label: cursor.format('D'),
      value: out,
    });
    cursor = cursor.add(1, 'day');
  }

  if (points.length === 0) {
    return [{ label: '1', value: 0 }];
  }
  return points;
}

/** Total des sorties sur le mois courant (dépenses + épargne). */
export function monthTotalOutflow(transactions: Transaction[]): number {
  return monthDailyOutflow(transactions).reduce((a, p) => a + p.value, 0);
}
