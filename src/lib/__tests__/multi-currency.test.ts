import {
  availableByIso,
  formatIsoTotals,
  sumByIso,
} from '@/src/lib/multi-currency';
import { makeTransaction } from '@/src/test/transaction-fixture';

describe('sumByIso', () => {
  it('somme par devise sans filtre de type', () => {
    const txs = [
      makeTransaction({
        id: 'a',
        kind: 'income',
        amount: 10,
        isoCurrency: 'USD',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      makeTransaction({
        id: 'b',
        kind: 'income',
        amount: 5,
        isoCurrency: 'usd',
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
    ];
    const m = sumByIso(txs);
    expect(m.get('USD')).toBe(15);
  });

  it('filtre par kinds', () => {
    const txs = [
      makeTransaction({
        id: '1',
        kind: 'income',
        amount: 100,
        isoCurrency: 'CDF',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      makeTransaction({
        id: '2',
        kind: 'expense',
        amount: 40,
        isoCurrency: 'CDF',
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
    ];
    const m = sumByIso(txs, ['income']);
    expect(m.get('CDF')).toBe(100);
  });

  it('utilise CDF si isoCurrency absent', () => {
    const txs = [
      makeTransaction({
        id: 'x',
        kind: 'expense',
        amount: 1,
        isoCurrency: '',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    ];
    const m = sumByIso(txs);
    expect(m.get('CDF')).toBe(1);
  });
});

describe('availableByIso', () => {
  it('signe les montants selon le type', () => {
    const txs = [
      makeTransaction({
        id: '1',
        kind: 'income',
        amount: 50,
        isoCurrency: 'EUR',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      makeTransaction({
        id: '2',
        kind: 'expense',
        amount: 20,
        isoCurrency: 'EUR',
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
    ];
    expect(availableByIso(txs).get('EUR')).toBe(30);
  });
});

describe('formatIsoTotals', () => {
  it('retourne un tiret si vide', () => {
    expect(formatIsoTotals(new Map())).toBe('—');
  });

  it('joint les devises triées (ordre ISO, format local)', () => {
    const m = new Map<string, number>([
      ['USD', 10],
      ['CDF', -5],
    ]);
    const s = formatIsoTotals(m);
    expect(s).toContain('CDF');
    // fr-FR affiche souvent « $US » plutôt que le code « USD »
    expect(s).toMatch(/\$US|USD/);
    expect(s).toMatch(/·/);
  });
});
