/** Normalise un symbole Yahoo (actions, indices, FX comme EURUSD=X). */
export function normalizeMarketSymbol(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function isValidMarketSymbol(s: string): boolean {
  if (s.length < 1 || s.length > 28) return false;
  return /^[\^A-Z0-9.\-=&]+$/i.test(s);
}
