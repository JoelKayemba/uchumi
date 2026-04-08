import { z } from 'zod';

import { CURRENCY_OPTIONS } from '@/src/constants/currencies';
import type { CurrencyOptionId } from '@/src/constants/currencies';

const currencyIdSet = new Set<string>(CURRENCY_OPTIONS.map((o) => o.id));

function isCurrencyOptionId(value: unknown): value is CurrencyOptionId {
  return typeof value === 'string' && currencyIdSet.has(value);
}

const currencyOptionIdSchema = z.custom<CurrencyOptionId>(isCurrencyOptionId, {
  message: 'Identifiant de devise inconnu',
});

const transactionSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['income', 'expense', 'savings']),
    amount: z.number().finite().positive(),
    label: z.string(),
    categoryId: z.string().nullable(),
    createdAt: z.string().min(1),
    isoCurrency: z.string().min(1).optional(),
    rateToDisplayCurrency: z.number().finite().positive().optional(),
    amountInDisplayCurrency: z.number().finite().positive().optional(),
    tags: z.array(z.string()).optional(),
    note: z.string().optional(),
    attachmentUri: z.string().nullable().optional(),
  })
  .transform((t) => ({
    ...t,
    isoCurrency: t.isoCurrency ?? 'CDF',
    rateToDisplayCurrency: t.rateToDisplayCurrency ?? 1,
    amountInDisplayCurrency: t.amountInDisplayCurrency ?? t.amount,
    tags: t.tags ?? [],
    note: t.note ?? '',
    attachmentUri: t.attachmentUri ?? null,
  }));

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

const subscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  amount: z.number().finite().nonnegative().optional(),
  currencyId: currencyOptionIdSchema.optional(),
  amountInDisplayCurrency: z.number().finite().nonnegative().optional(),
  billingDayOfMonth: z.number().int().min(1).max(28),
  preset: z.string(),
  isMonthlyRecurring: z.boolean().optional(),
  lastAutoRecordedMonth: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  remindDaysBefore: z.number().int().min(0).max(28).optional(),
  autoRecordExpense: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export const uchumiExportV1Schema = z.object({
  exportVersion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  exportedAt: z.string().optional(),
  app: z.string().optional(),
  appMode: z.enum(['personal', 'business']).nullable().optional(),
  currency: currencyOptionIdSchema.optional(),
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema),
  subscriptions: z.array(subscriptionSchema).optional(),
});

export type UchumiExportV1 = z.infer<typeof uchumiExportV1Schema>;
