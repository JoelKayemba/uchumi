/**
 * Devises d’affichage et de mouvement (liste courte). `icon` = drapeau / symbole (emoji).
 */
export const CURRENCY_OPTIONS = [
  {
    id: 'xof',
    label: 'FCFA — UEMOA (XOF)',
    iso4217: 'XOF',
    region: 'afrique',
    icon: '🇸🇳',
  },
  {
    id: 'xaf',
    label: 'FCFA — CEMAC (XAF)',
    iso4217: 'XAF',
    region: 'afrique',
    icon: '🇨🇲',
  },
  {
    id: 'cad',
    label: 'Dollar canadien — CAD',
    iso4217: 'CAD',
    region: 'ameriques',
    icon: '🇨🇦',
  },
  {
    id: 'usd',
    label: 'Dollar américain — USD',
    iso4217: 'USD',
    region: 'ameriques',
    icon: '🇺🇸',
  },
  {
    id: 'eur',
    label: 'Euro — EUR',
    iso4217: 'EUR',
    region: 'europe',
    icon: '🇪🇺',
  },
  {
    id: 'cdf',
    label: 'Franc congolais — CDF',
    iso4217: 'CDF',
    region: 'afrique',
    icon: '🇨🇩',
  },
] as const;

export type CurrencyOptionId = (typeof CURRENCY_OPTIONS)[number]['id'];

/** Ordre d’affichage : FCFA (2 variantes), CAD, USD, Euro, CDF. */
const DISPLAY_ORDER: readonly CurrencyOptionId[] = [
  'xof',
  'xaf',
  'cad',
  'usd',
  'eur',
  'cdf',
];

/** Devise par défaut : franc congolais (CDF). */
export const DEFAULT_CURRENCY: CurrencyOptionId = 'cdf';

export function currencyOptionToIso(id: CurrencyOptionId): string {
  const o = CURRENCY_OPTIONS.find((x) => x.id === id);
  return o?.iso4217 ?? 'CDF';
}

/** Libellé affichable (réglages, listes). */
export function currencyOptionLabel(id: CurrencyOptionId): string {
  return CURRENCY_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

export function currencyOptionIcon(id: CurrencyOptionId): string {
  return CURRENCY_OPTIONS.find((x) => x.id === id)?.icon ?? '🇨🇩';
}

/** Options dans l’ordre produit (pas alphabétique). */
export function getSortedCurrencyOptions(): readonly (typeof CURRENCY_OPTIONS)[number][] {
  const rank = new Map(DISPLAY_ORDER.map((id, i) => [id, i]));
  return [...CURRENCY_OPTIONS].sort(
    (a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99)
  );
}

const SECTION_TITLE = 'Devises';

/**
 * Une seule section pour la liste courte (réglages + recherche).
 */
export function groupCurrenciesForSettings(
  options: readonly (typeof CURRENCY_OPTIONS)[number][]
): { title: string; items: (typeof CURRENCY_OPTIONS)[number][] }[] {
  if (options.length === 0) return [];
  return [{ title: SECTION_TITLE, items: [...options] }];
}
