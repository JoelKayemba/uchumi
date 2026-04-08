import {
  currencyOptionToIso,
  type CurrencyOptionId,
  DEFAULT_CURRENCY,
} from '@/src/constants/currencies';

/**
 * Affiche un montant avec la devise choisie (Intl).
 */
export function formatCurrency(
  amount: number,
  currencyId: CurrencyOptionId = DEFAULT_CURRENCY
): string {
  const iso = currencyOptionToIso(currencyId);
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: iso,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${iso}`;
  }
}

/**
 * Affichage avec un code ISO 4217 (mouvement dans sa devise d’origine).
 */
export function formatCurrencyIso(amount: number, iso4217: string): string {
  const iso = iso4217.toUpperCase();
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: iso,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${iso}`;
  }
}
