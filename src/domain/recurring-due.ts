import dayjs from 'dayjs';

import type { RecurringRule } from '@/src/types/recurring';

export function isDue(rule: RecurringRule, now = new Date()): boolean {
  if (!rule.isActive) return false;
  const due = dayjs(rule.nextDueAt);
  return !due.isAfter(dayjs(now), 'day');
}

export function advanceNextDue(rule: RecurringRule): RecurringRule {
  const base = dayjs(rule.nextDueAt);
  if (rule.frequency === 'monthly') {
    const next = base.add(1, 'month');
    return { ...rule, nextDueAt: next.startOf('day').toISOString() };
  }
  const next = base.add(1, 'week');
  return { ...rule, nextDueAt: next.startOf('day').toISOString() };
}
