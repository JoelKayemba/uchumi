/** Indices affichés en tête de l’onglet Marchés (symboles Yahoo). */
export const MARKET_INDEX_SYMBOLS: readonly {
  symbol: string;
  label: string;
}[] = [
  { symbol: '^FCHI', label: 'CAC 40' },
  { symbol: '^STOXX50E', label: 'Euro Stoxx 50' },
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'NASDAQ' },
  { symbol: 'GC=F', label: 'Or (future)' },
];
