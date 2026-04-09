import {
  applyLoanAccruals,
  clampDebitDay,
  estimatedInstallmentsLeft,
  firstDebitOnOrAfter,
} from '@/src/domain/loan-accrual';
import type { Loan } from '@/src/types/loan';
import dayjs from 'dayjs';

function baseLoan(p: Partial<Loan> & Pick<Loan, 'id'>): Loan {
  return {
    name: 'Test',
    totalAmount: 1000,
    monthlyPayment: 100,
    remainingAmount: 1000,
    debitDay: 15,
    createdAt: '2026-04-10T12:00:00.000Z',
    lastProcessedMonth: null,
    note: '',
    ...p,
  };
}

describe('clampDebitDay', () => {
  it('borne entre 1 et 28', () => {
    expect(clampDebitDay(0)).toBe(1);
    expect(clampDebitDay(15)).toBe(15);
    expect(clampDebitDay(31)).toBe(28);
  });
});

describe('firstDebitOnOrAfter', () => {
  it('pousse au mois suivant si la première échéance est avant la création', () => {
    const d = firstDebitOnOrAfter(dayjs('2026-04-20'), 15);
    expect(d.format('YYYY-MM-DD')).toBe('2026-05-15');
  });

  it('garde le mois courant si l’échéance est après la création', () => {
    const d = firstDebitOnOrAfter(dayjs('2026-04-10'), 15);
    expect(d.format('YYYY-MM-DD')).toBe('2026-04-15');
  });
});

describe('applyLoanAccruals', () => {
  it('ne déduit pas avant le jour de prélèvement', () => {
    const loan = baseLoan({ id: '1' });
    const r = applyLoanAccruals([loan], new Date('2026-04-12T12:00:00'));
    expect(r[0].remainingAmount).toBe(1000);
    expect(r[0].lastProcessedMonth).toBeNull();
  });

  it('déduit une fois après la date d’échéance', () => {
    const loan = baseLoan({ id: '2' });
    const r = applyLoanAccruals([loan], new Date('2026-04-20T12:00:00'));
    expect(r[0].remainingAmount).toBe(900);
    expect(r[0].lastProcessedMonth).toBe('2026-04');
  });

  it('enchaîne plusieurs mois', () => {
    const loan = baseLoan({
      id: '3',
      lastProcessedMonth: '2026-02',
      remainingAmount: 1000,
    });
    const r = applyLoanAccruals([loan], new Date('2026-04-20T12:00:00'));
    expect(r[0].lastProcessedMonth).toBe('2026-04');
    expect(r[0].remainingAmount).toBe(800);
  });
});

describe('estimatedInstallmentsLeft', () => {
  it('estime le nombre de mensualités', () => {
    const loan = baseLoan({ id: '4', remainingAmount: 250, monthlyPayment: 100 });
    expect(estimatedInstallmentsLeft(loan)).toBe(3);
  });

  it('retourne null si pas de mensualité', () => {
    const loan = baseLoan({ id: '5', monthlyPayment: 0 });
    expect(estimatedInstallmentsLeft(loan)).toBeNull();
  });
});
