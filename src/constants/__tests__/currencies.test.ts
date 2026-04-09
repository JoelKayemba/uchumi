import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  currencyOptionToIso,
  getSortedCurrencyOptions,
} from '@/src/constants/currencies';

describe('currencies', () => {
  it('a une devise par défaut CDF', () => {
    expect(DEFAULT_CURRENCY).toBe('cdf');
    expect(currencyOptionToIso(DEFAULT_CURRENCY)).toBe('CDF');
  });

  it('currencyOptionToIso couvre les principales devises', () => {
    expect(currencyOptionToIso('usd')).toBe('USD');
    expect(currencyOptionToIso('eur')).toBe('EUR');
  });

  it('getSortedCurrencyOptions contient toutes les options', () => {
    const sorted = getSortedCurrencyOptions();
    expect(sorted.length).toBe(CURRENCY_OPTIONS.length);
    const ids = new Set(sorted.map((o) => o.id));
    for (const o of CURRENCY_OPTIONS) {
      expect(ids.has(o.id)).toBe(true);
    }
  });
});
