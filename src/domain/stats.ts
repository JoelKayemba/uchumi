import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import type { Category } from '@/src/types/category';
import type { Transaction } from '@/src/types/transaction';

dayjs.extend(isoWeek);

export type StatsPeriod = 'week' | 'month' | 'all';

export type KindTotals = {
  income: number;
  expense: number;
  savings: number;
};

export type CategoryOutflowRow = {
  categoryId: string | null;
  name: string;
  color: string;
  total: number;
};

export function filterByPeriod(
  transactions: Transaction[],
  period: StatsPeriod
): Transaction[] {
  if (period === 'all') {
    return transactions;
  }
  const now = dayjs();
  const start =
    period === 'week' ? now.startOf('isoWeek') : now.startOf('month');
  const end = period === 'week' ? now.endOf('isoWeek') : now.endOf('month');
  const min = start.valueOf();
  const max = end.valueOf();
  return transactions.filter((t) => {
    const v = dayjs(t.createdAt).valueOf();
    return v >= min && v <= max;
  });
}

/** Mouvements du jour civil courant (fuseau local). */
export function filterTransactionsToday(
  transactions: Transaction[]
): Transaction[] {
  const start = dayjs().startOf('day');
  const end = dayjs().endOf('day');
  const min = start.valueOf();
  const max = end.valueOf();
  return transactions.filter((t) => {
    const v = dayjs(t.createdAt).valueOf();
    return v >= min && v <= max;
  });
}

export function sumByKind(transactions: Transaction[]): KindTotals {
  const totals: KindTotals = { income: 0, expense: 0, savings: 0 };
  for (const t of transactions) {
    totals[t.kind] += t.amountInDisplayCurrency;
  }
  return totals;
}

/** Dépenses + épargne regroupées par catégorie (montants sortants). */
export function aggregateOutflowByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategoryOutflowRow[] {
  const only = transactions.filter(
    (t) => t.kind === 'expense' || t.kind === 'savings'
  );
  const map = new Map<string | null, number>();
  for (const t of only) {
    map.set(
      t.categoryId,
      (map.get(t.categoryId) ?? 0) + t.amountInDisplayCurrency
    );
  }
  const rows: CategoryOutflowRow[] = [...map.entries()].map(
    ([categoryId, total]) => {
      const cat = categoryId
        ? categories.find((c) => c.id === categoryId)
        : undefined;
      return {
        categoryId,
        total,
        name: cat?.name ?? (categoryId ? 'Autre' : 'Sans catégorie'),
        color: cat?.color ?? '#948E89',
      };
    }
  );
  rows.sort((a, b) => b.total - a.total);
  return rows;
}
