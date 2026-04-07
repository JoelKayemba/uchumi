import { useCallback } from 'react';

import { DEFAULT_CURRENCY } from '@/src/constants/currencies';
import { formatCurrency } from '@/src/lib/format-currency';
import { useAppStore } from '@/src/store/use-app-store';

export function useFormatCurrency() {
  const currency = useAppStore((s) => s.currency ?? DEFAULT_CURRENCY);
  return useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  );
}
