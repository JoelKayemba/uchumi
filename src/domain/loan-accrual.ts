import dayjs from 'dayjs';

import type { Loan } from '@/src/types/loan';

/** Jour de prélèvement sécurisé (évite 29–31 pour des mois courts). */
export function clampDebitDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(28, Math.max(1, Math.floor(day)));
}

/** Date du prélèvement dans le mois `YYYY-MM`. */
export function debitDateInMonth(yearMonth: string, debitDay: number): dayjs.Dayjs {
  const base = dayjs(`${yearMonth}-01`);
  const d = clampDebitDay(debitDay);
  const last = base.daysInMonth();
  const day = Math.min(d, last);
  return base.date(day).startOf('day');
}

/** Première date d’échéance le jour `debitDay` tombant le même jour ou après la création du prêt. */
export function firstDebitOnOrAfter(createdAt: dayjs.Dayjs, debitDay: number): dayjs.Dayjs {
  const created = createdAt.startOf('day');
  const d = clampDebitDay(debitDay);
  let m = created.startOf('month');
  for (let i = 0; i < 240; i++) {
    const due = debitDateInMonth(m.format('YYYY-MM'), d);
    if (!due.isBefore(created, 'day')) {
      return due;
    }
    m = m.add(1, 'month');
  }
  return debitDateInMonth(created.format('YYYY-MM'), d);
}

/**
 * Déduit chaque mensualité due (échéance passée ou aujourd’hui) depuis la création
 * ou depuis le mois suivant `lastProcessedMonth`.
 */
export function applyLoanAccruals(loans: Loan[], now: Date = new Date()): Loan[] {
  const today = dayjs(now).startOf('day');
  return loans.map((loan) => {
    if (loan.monthlyPayment <= 0 || loan.remainingAmount <= 0) {
      return loan;
    }

    const debitD = clampDebitDay(loan.debitDay);
    const created = dayjs(loan.createdAt);

    let startMonth: dayjs.Dayjs;
    if (loan.lastProcessedMonth) {
      startMonth = dayjs(`${loan.lastProcessedMonth}-01`).add(1, 'month');
    } else {
      startMonth = firstDebitOnOrAfter(created, debitD).startOf('month');
    }

    let remaining = loan.remainingAmount;
    let lastP = loan.lastProcessedMonth;
    let cursor = startMonth;

    for (let i = 0; i < 600; i++) {
      const ym = cursor.format('YYYY-MM');
      const due = debitDateInMonth(ym, debitD);
      if (due.isAfter(today, 'day')) break;
      if (remaining <= 0) break;
      const pay = Math.min(loan.monthlyPayment, remaining);
      remaining -= pay;
      lastP = ym;
      if (remaining <= 0) {
        remaining = 0;
        break;
      }
      cursor = cursor.add(1, 'month');
    }

    if (
      lastP === loan.lastProcessedMonth &&
      remaining === loan.remainingAmount
    ) {
      return loan;
    }

    return {
      ...loan,
      remainingAmount: remaining,
      lastProcessedMonth: lastP,
    };
  });
}

/** Nombre de mensualités restantes (estimation, plafonné). */
export function estimatedInstallmentsLeft(loan: Loan): number | null {
  if (loan.monthlyPayment <= 0) return null;
  return Math.ceil(loan.remainingAmount / loan.monthlyPayment);
}
