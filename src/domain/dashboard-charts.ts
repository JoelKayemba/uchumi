import dayjs from 'dayjs';

import type { Transaction } from '@/src/types/transaction';

export type DayBar = {
  /** JJ */
  label: string;
  /** Dépenses + épargne du jour (devise affichage). */
  outflow: number;
  /** Entrées du jour. */
  inflow: number;
};

/**
 * 7 derniers jours (fuseau local) : entrées et sorties par jour.
 */
export function last7DaysBars(transactions: Transaction[]): DayBar[] {
  const bars: DayBar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day');
    const start = d.startOf('day').valueOf();
    const end = d.endOf('day').valueOf();
    let outflow = 0;
    let inflow = 0;
    for (const t of transactions) {
      const ts = dayjs(t.createdAt).valueOf();
      if (ts < start || ts > end) continue;
      if (t.kind === 'income') {
        inflow += t.amountInDisplayCurrency;
      } else {
        outflow += t.amountInDisplayCurrency;
      }
    }
    bars.push({
      label: d.format('DD'),
      outflow,
      inflow,
    });
  }
  return bars;
}

export function maxBarValue(bars: DayBar[]): number {
  let m = 1;
  for (const b of bars) {
    m = Math.max(m, b.outflow, b.inflow);
  }
  return m;
}
