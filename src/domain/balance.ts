import type { Transaction } from '@/src/types/transaction';

/**
 * Solde « disponible » : entrées moins dépenses et mises de côté.
 */
export function computeAvailable(transactions: Transaction[]): number {
  let sum = 0;
  for (const t of transactions) {
    const v = t.amount;
    if (t.kind === 'income') {
      sum += v;
    } else {
      sum -= v;
    }
  }
  return sum;
}
