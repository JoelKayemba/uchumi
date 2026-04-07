export type CurrencyOptionId =
  | 'generic'
  | 'cdf'
  | 'eur'
  | 'usd'
  | 'xof'
  | 'xaf';

export const DEFAULT_CURRENCY: CurrencyOptionId = 'generic';

/** Options d’affichage global + code ISO pour API / mouvements. */
export const CURRENCY_OPTIONS: readonly {
  id: CurrencyOptionId;
  label: string;
  iso4217: string;
}[] = [
  { id: 'generic', label: 'Franc — F (générique)', iso4217: 'CDF' },
  { id: 'cdf', label: 'Franc congolais — CDF', iso4217: 'CDF' },
  { id: 'eur', label: 'Euro — EUR', iso4217: 'EUR' },
  { id: 'usd', label: 'Dollar US — USD', iso4217: 'USD' },
  { id: 'xof', label: 'Franc CFA Ouest — XOF', iso4217: 'XOF' },
  { id: 'xaf', label: 'Franc CFA Centrafrique — XAF', iso4217: 'XAF' },
] as const;

export function currencyOptionToIso(id: CurrencyOptionId): string {
  return CURRENCY_OPTIONS.find((o) => o.id === id)?.iso4217 ?? 'CDF';
}
