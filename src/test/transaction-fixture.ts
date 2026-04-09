import type { Transaction } from '@/src/types/transaction';

/** Mouvement minimal pour les tests unitaires (domaine / lib). */
export function makeTransaction(
  partial: Partial<Transaction> &
    Pick<Transaction, 'id' | 'kind' | 'amount' | 'createdAt'>
): Transaction {
  const amount = partial.amount;
  return {
    isoCurrency: partial.isoCurrency ?? 'CDF',
    rateToDisplayCurrency: partial.rateToDisplayCurrency ?? 1,
    amountInDisplayCurrency: partial.amountInDisplayCurrency ?? amount,
    label: partial.label ?? '',
    categoryId: partial.categoryId ?? null,
    tags: partial.tags ?? [],
    note: partial.note ?? '',
    attachmentUri: partial.attachmentUri ?? null,
    ...partial,
  };
}
