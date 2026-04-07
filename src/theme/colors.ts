/**
 * Palette UCHUMI — thème sombre premium (doc produit).
 */
export const colors = {
  marshland: '#040503',
  dune: '#352E2C',
  fuscousGray: '#5A544E',
  naturalGray: '#948E89',
  tapa: '#78716B',
  /** Texte principal sur fond sombre */
  textPrimary: '#F4F1EE',
  textSecondary: '#C9C4BF',
  textMuted: '#948E89',
  /** Accents */
  accent: '#A89F96',
  danger: '#C45C5C',
  success: '#7A9E7A',
} as const;

export type ColorName = keyof typeof colors;
