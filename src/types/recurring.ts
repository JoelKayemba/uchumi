import type { TransactionKind } from '@/src/types/transaction';

export type RecurringFrequency = 'weekly' | 'monthly';

export type RecurringRule = {
  id: string;
  kind: TransactionKind;
  amount: number;
  isoCurrency: string;
  rateToDisplayCurrency: number;
  amountInDisplayCurrency: number;
  label: string;
  categoryId: string | null;
  frequency: RecurringFrequency;
  /** 1–28 pour mensuel (sécurité fin de mois). */
  dayOfMonth: number | null;
  /** 0 = dimanche … 6 = samedi pour hebdo. */
  weekday: number | null;
  /** Prochaine échéance ISO. */
  nextDueAt: string;
  isActive: boolean;
};
