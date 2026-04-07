import dayjs from 'dayjs';

import type { Transaction } from '@/src/types/transaction';

import { sumByKind } from '@/src/domain/stats';

function filterMonth(transactions: Transaction[], offset: number): Transaction[] {
  const m = dayjs().add(offset, 'month');
  const start = m.startOf('month').valueOf();
  const end = m.endOf('month').valueOf();
  return transactions.filter((t) => {
    const v = dayjs(t.createdAt).valueOf();
    return v >= start && v <= end;
  });
}

export function compareLastTwoMonths(transactions: Transaction[]) {
  const cur = sumByKind(filterMonth(transactions, 0));
  const prev = sumByKind(filterMonth(transactions, -1));
  return {
    current: cur,
    previous: prev,
    netCurrent: cur.income - cur.expense - cur.savings,
    netPrevious: prev.income - prev.expense - prev.savings,
  };
}
