import { computeAvailable } from '@/src/domain/balance';
import { makeTransaction } from '@/src/test/transaction-fixture';

describe('computeAvailable', () => {
  it('retourne 0 sans mouvements', () => {
    expect(computeAvailable([])).toBe(0);
  });

  it('additionne les entrées et soustrait le reste', () => {
    const txs = [
      makeTransaction({
        id: '1',
        kind: 'income',
        amount: 100,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      makeTransaction({
        id: '2',
        kind: 'expense',
        amount: 30,
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
      makeTransaction({
        id: '3',
        kind: 'savings',
        amount: 20,
        createdAt: '2026-01-03T00:00:00.000Z',
      }),
    ];
    expect(computeAvailable(txs)).toBe(100 - 30 - 20);
  });
});
