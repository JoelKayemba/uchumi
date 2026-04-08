import { formatCurrencyIso } from '@/src/lib/format-currency';
import type { Transaction, TransactionKind } from '@/src/types/transaction';

export function sumByIso(
  transactions: readonly Transaction[],
  kinds?: readonly TransactionKind[]
): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of transactions) {
    if (kinds && !kinds.includes(t.kind)) continue;
    const iso = (t.isoCurrency || 'CDF').toUpperCase();
    out.set(iso, (out.get(iso) ?? 0) + t.amount);
  }
  return out;
}

export function availableByIso(transactions: readonly Transaction[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of transactions) {
    const iso = (t.isoCurrency || 'CDF').toUpperCase();
    const signed = t.kind === 'income' ? t.amount : -t.amount;
    out.set(iso, (out.get(iso) ?? 0) + signed);
  }
  return out;
}

export function formatIsoTotals(totals: Map<string, number>): string {
  const entries = [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return '—';
  return entries
    .map(([iso, amount]) => formatCurrencyIso(amount, iso))
    .join(' · ');
}
