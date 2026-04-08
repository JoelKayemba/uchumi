import {
  currencyOptionToIso,
  DEFAULT_CURRENCY,
  type CurrencyOptionId,
} from '@/src/constants/currencies';

/**
 * Valeur indicative en EUR d’1 unité de monnaie (ISO 4217), pour prévision hors ligne.
 * Ordres de grandeur approximatifs — pas un cours temps réel.
 */
const EUR_PER_ONE_UNIT: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  CAD: 0.67,
  CDF: 0.0003,
  XOF: 0.0015,
  XAF: 0.0015,
};

function eurPerUnit(iso: string): number {
  const u = iso.toUpperCase();
  return EUR_PER_ONE_UNIT[u] ?? EUR_PER_ONE_UNIT[DEFAULT_CURRENCY] ?? 0.0003;
}

/**
 * Convertit un montant depuis la devise de l’abonnement vers la devise d’affichage globale.
 */
export function subscriptionAmountToDisplay(
  amount: number,
  from: CurrencyOptionId,
  display: CurrencyOptionId
): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  if (from === display) return amount;
  const fromIso = currencyOptionToIso(from);
  const displayIso = currencyOptionToIso(display);
  const fromEur = eurPerUnit(fromIso);
  const displayEur = eurPerUnit(displayIso);
  if (displayEur <= 0) return amount;
  return (amount * fromEur) / displayEur;
}
