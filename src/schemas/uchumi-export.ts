import { z } from 'zod';

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

export const uchumiExportV1Schema = z.object({
  exportVersion: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string().optional(),
  app: z.string().optional(),
  appMode: z.enum(['personal', 'business']).nullable().optional(),
  currency: z
    .enum(['generic', 'cdf', 'eur', 'usd', 'xof', 'xaf'])
    .optional(),
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema),
});

export type UchumiExportV1 = z.infer<typeof uchumiExportV1Schema>;
