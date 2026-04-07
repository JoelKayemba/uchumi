import dayjs from 'dayjs';

/**
 * Série de jours consécutifs avec au moins un mouvement enregistré.
 * `lastDate` = dernier jour (YYYY-MM-DD) ayant contribué à la série.
 */
export function nextStreak(
  prevCount: number,
  lastDate: string | null
): { count: number; lastDate: string } {
  const today = dayjs().format('YYYY-MM-DD');
  if (lastDate === today) {
    return { count: Math.max(1, prevCount), lastDate: today };
  }
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (lastDate === yesterday) {
    return { count: Math.max(1, prevCount) + 1, lastDate: today };
  }
  return { count: 1, lastDate: today };
}
