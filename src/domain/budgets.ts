import dayjs from 'dayjs';

import type { Transaction } from '@/src/types/transaction';

/** Dépenses + épargne du mois civil courant pour une catégorie (devise affichage). */
export function spendInCategoryThisMonth(
  transactions: Transaction[],
  categoryId: string
): number {
  const start = dayjs().startOf('month').valueOf();
  const end = dayjs().endOf('month').valueOf();
  let sum = 0;
  for (const t of transactions) {
    if (t.categoryId !== categoryId) continue;
    if (t.kind !== 'expense' && t.kind !== 'savings') continue;
    const ts = dayjs(t.createdAt).valueOf();
    if (ts < start || ts > end) continue;
    sum += t.amountInDisplayCurrency;
  }
  return sum;
}
