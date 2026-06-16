/**
 * Centralised scoring rules (ported from the v1 Zustand store).
 *
 *   points = BASE + (timeRemaining × TIME_BONUS) + (streak × STREAK_BONUS)
 *
 * `streak` is the streak level *before* the current answer.
 */
export const BASE_POINTS = 100;
export const TIME_BONUS_PER_SEC = 10;
export const STREAK_BONUS_PER_LEVEL = 20;

export interface ScoreInput {
  isCorrect: boolean;
  timeRemaining: number;
  streak: number;
}

export function computePoints({
  isCorrect,
  timeRemaining,
  streak,
}: ScoreInput): number {
  if (!isCorrect) return 0;
  return (
    BASE_POINTS +
    Math.max(0, timeRemaining) * TIME_BONUS_PER_SEC +
    Math.max(0, streak) * STREAK_BONUS_PER_LEVEL
  );
}

export function nextStreak(current: number, isCorrect: boolean): number {
  return isCorrect ? current + 1 : 0;
}

/** Theoretical max points for a single question (used for accuracy display). */
export function maxPointsPerQuestion(maxTime: number): number {
  return BASE_POINTS + maxTime * TIME_BONUS_PER_SEC;
}
