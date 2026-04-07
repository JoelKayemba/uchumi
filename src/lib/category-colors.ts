/** Couleurs cyclées pour les nouvelles catégories (cohérent avec la palette UCHUMI). */
const PALETTE = [
  '#8B7355',
  '#5A7D6A',
  '#6B6B8C',
  '#7A6B8C',
  '#8C6B6B',
  '#948E89',
  '#5A544E',
  '#78716B',
];

export function pickCategoryColor(index: number): string {
  return PALETTE[index % PALETTE.length] ?? PALETTE[0];
}
