import dayjs from 'dayjs';

import { filterByPeriod, sumByKind } from '@/src/domain/stats';
import { makeTransaction } from '@/src/test/transaction-fixture';

describe('sumByKind', () => {
  it('agrège par type sur amountInDisplayCurrency', () => {
    const txs = [
      makeTransaction({
        id: '1',
        kind: 'income',
        amount: 10,
        amountInDisplayCurrency: 10,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      makeTransaction({
        id: '2',
        kind: 'expense',
        amount: 3,
        amountInDisplayCurrency: 3,
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
      makeTransaction({
        id: '3',
        kind: 'savings',
        amount: 2,
        amountInDisplayCurrency: 2,
        createdAt: '2026-01-03T00:00:00.000Z',
      }),
    ];
    expect(sumByKind(txs)).toEqual({
      income: 10,
      expense: 3,
      savings: 2,
    });
  });
});

describe('filterByPeriod', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-15T12:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('all retourne tout', () => {
    const txs = [
      makeTransaction({
        id: '1',
        kind: 'expense',
        amount: 1,
        createdAt: '2020-01-01T00:00:00.000Z',
      }),
    ];
    expect(filterByPeriod(txs, 'all')).toHaveLength(1);
  });

  it('month ne garde que le mois courant', () => {
    const inMonth = makeTransaction({
      id: 'in',
      kind: 'expense',
      amount: 1,
      createdAt: dayjs('2026-04-10').toISOString(),
    });
    const outMonth = makeTransaction({
      id: 'out',
      kind: 'expense',
      amount: 1,
      createdAt: dayjs('2026-03-30').toISOString(),
    });
    const r = filterByPeriod([inMonth, outMonth], 'month');
    expect(r.map((t) => t.id)).toEqual(['in']);
  });

  it('week ne garde que la semaine ISO courante', () => {
    // 15 avril 2026 = mercredi ; semaine ISO inclut le 13 (lundi)
    const inWeek = makeTransaction({
      id: 'w1',
      kind: 'expense',
      amount: 1,
      createdAt: dayjs('2026-04-13T10:00:00').toISOString(),
    });
    const outWeek = makeTransaction({
      id: 'w0',
      kind: 'expense',
      amount: 1,
      createdAt: dayjs('2026-04-11T10:00:00').toISOString(),
    });
    const r = filterByPeriod([inWeek, outWeek], 'week');
    expect(r.map((t) => t.id)).toEqual(['w1']);
  });
});
