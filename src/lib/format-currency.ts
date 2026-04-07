import {
  type CurrencyOptionId,
  DEFAULT_CURRENCY,
} from '@/src/constants/currencies';

const CONFIG: Record<
  CurrencyOptionId,
  { locale: string; currency?: string; suffix?: string }
> = {
  generic: { locale: 'fr-FR', suffix: ' F' },
  cdf: { locale: 'fr-CD', currency: 'CDF' },
  eur: { locale: 'fr-FR', currency: 'EUR' },
  usd: { locale: 'fr-FR', currency: 'USD' },
  xof: { locale: 'fr-FR', currency: 'XOF' },
  xaf: { locale: 'fr-FR', currency: 'XAF' },
};

/**
 * Affiche un montant avec la devise choisie (Intl ou suffixe générique).
 */
export function formatCurrency(
  amount: number,
  currencyId: CurrencyOptionId = DEFAULT_CURRENCY
): string {
  const opt = CONFIG[currencyId] ?? CONFIG[DEFAULT_CURRENCY];
  if (opt.currency) {
    try {
      return new Intl.NumberFormat(opt.locale, {
        style: 'currency',
        currency: opt.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Intl indisponible ou devise non supportée
    }
  }
  const num = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${num}${opt.suffix ?? ' F'}`;
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
