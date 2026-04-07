/**
 * Taux de change sans clé API (fetch suffit — pas besoin d’axios).
 * Source : @fawazahmed0/currency-api via jsDelivr (large couverture de devises).
 * 1 unité de `fromIso` = `rate` unités de `toIso`.
 */
const RATES_URL = (baseLower: string) =>
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${encodeURIComponent(baseLower)}.json`;

export async function getExchangeRate(
  fromIso: string,
  toIso: string
): Promise<number> {
  const from = fromIso.toUpperCase();
  const to = toIso.toUpperCase();
  if (from === to) return 1;

  const base = from.toLowerCase();
  const quote = to.toLowerCase();

  const res = await fetch(RATES_URL(base));
  if (!res.ok) {
    throw new Error(`Erreur réseau (${res.status})`);
  }

  const data = (await res.json()) as Record<
    string,
    Record<string, number> | string | undefined
  >;

  const block = data[base];
  if (!block || typeof block === 'string') {
    throw new Error(
      `Taux indisponible pour ${from} → ${to}. La devise de départ n’est peut‑être pas prise en charge.`
    );
  }

  const rate = block[quote];
  if (typeof rate !== 'number' || !Number.isFinite(rate)) {
    throw new Error(
      `Taux indisponible pour ${from} → ${to}. Essayez une autre devise ou plus tard.`
    );
  }
  return rate;
}
