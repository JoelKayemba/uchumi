import { formatCurrency, formatCurrencyIso } from '@/src/lib/format-currency';

describe('formatCurrency', () => {
  it('formate en francs congolais par défaut', () => {
    const s = formatCurrency(1200);
    expect(s).toMatch(/1[\s\u202f\u00a0]?200/);
    expect(s.toLowerCase()).toContain('cdf');
  });

  it('accepte une devise optionnelle', () => {
    const s = formatCurrency(99, 'usd');
    expect(s).toMatch(/99/);
  });
});

describe('formatCurrencyIso', () => {
  it('utilise le code ISO fourni', () => {
    const s = formatCurrencyIso(50, 'eur');
    expect(s).toMatch(/50/);
  });
});
