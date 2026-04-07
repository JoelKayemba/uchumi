/**
 * Cotations via l’API Yahoo Finance (chart v8), utilisée côté mobile sans CORS.
 * Données indicatives (souvent différées), à titre informatif uniquement.
 */

export type MarketQuote = {
  symbol: string;
  shortName: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
};

type YahooChartMeta = {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  currency?: string;
  shortName?: string;
  longName?: string;
  symbol?: string;
};

function parseYahooJson(data: unknown): MarketQuote | null {
  const d = data as {
    chart?: {
      result?: { meta?: YahooChartMeta }[];
      error?: { description?: string };
    };
  };
  const err = d.chart?.error;
  if (err) {
    throw new Error(err.description ?? 'Réponse Yahoo invalide.');
  }
  const meta = d.chart?.result?.[0]?.meta;
  if (!meta) return null;

  const price = meta.regularMarketPrice;
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return null;
  }
  const prev =
    typeof meta.chartPreviousClose === 'number'
      ? meta.chartPreviousClose
      : typeof meta.previousClose === 'number'
        ? meta.previousClose
        : price;
  const change = price - prev;
  const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
  const name =
    meta.shortName ?? meta.longName ?? meta.symbol ?? '';
  const currency = meta.currency ?? '—';

  return {
    symbol: meta.symbol ?? '',
    shortName: name,
    price,
    currency,
    change,
    changePercent,
  };
}

export async function fetchMarketQuote(symbol: string): Promise<MarketQuote> {
  const s = symbol.trim();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; UCHUMI/1.0)',
    },
  });
  if (!res.ok) {
    throw new Error(`Réseau (${res.status})`);
  }
  const json: unknown = await res.json();
  const quote = parseYahooJson(json);
  if (!quote) {
    throw new Error(`Cotation introuvable pour « ${s} ».`);
  }
  return quote;
}

export async function fetchMarketQuotes(
  symbols: string[]
): Promise<{ symbol: string; quote: MarketQuote | null; error?: string }[]> {
  const unique = [...new Set(symbols.map((x) => x.trim()).filter(Boolean))];
  const results = await Promise.all(
    unique.map(async (symbol) => {
      try {
        const quote = await fetchMarketQuote(symbol);
        return { symbol, quote };
      } catch (e) {
        return {
          symbol,
          quote: null,
          error: e instanceof Error ? e.message : 'Erreur',
        };
      }
    })
  );
  return results;
}
