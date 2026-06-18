"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import {
  evaluateAchievements,
  computeDailyStreak,
  computeMpConsecWins,
  type PlayerStats,
} from "@/lib/achievements";
import { maxPointsPerQuestion } from "@/lib/scoring";

const MAX_TIME = 15;
const MAX_PER_Q = maxPointsPerQuestion(MAX_TIME);

export interface NewAchievement {
  id: string;
  name: string;
  emoji: string;
}

/**
 * Recompute the current user's achievements from the DB and persist any
 * newly unlocked ones. Returns the list of achievements that were unlocked
 * for the first time by this call (empty array if none / not signed in).
 */
export async function syncAchievements(): Promise<NewAchievement[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = await createClient();

  const [attemptsRes, mpResultsRes, alreadyRes, profileRes] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("score, correct_count, total, max_streak, quiz_date")
      .eq("user_id", userId),
    supabase
      .from("match_results")
      .select("won")
      .eq("user_id", userId)
      .order("played_at", { ascending: true }),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const attempts = attemptsRes.data ?? [];
  const mpResults = mpResultsRes.data ?? [];
  const alreadyUnlocked = new Set((alreadyRes.data ?? []).map((r) => r.achievement_id));

  const dailyStreak = computeDailyStreak(attempts.map((a) => a.quiz_date as string));
  const perfectQuizCount = attempts.filter((a) => a.correct_count === a.total).length;
  const bestEfficiency = attempts.reduce((best, a) => {
    const maxScore = (a.total as number) * MAX_PER_Q;
    const eff = maxScore > 0 ? Math.min(100, Math.round(((a.score as number) / maxScore) * 100)) : 0;
    return Math.max(best, eff);
  }, 0);
  const mpConsecWins = computeMpConsecWins(mpResults as { won: boolean }[]);
  const mpWins = mpResults.filter((r) => r.won).length;

  const stats: PlayerStats = {
    quizGames: attempts.length,
    perfectQuiz: attempts.some((a) => a.correct_count === a.total),
    perfectQuizCount,
    bestQuizStreak: attempts.reduce((m, a) => Math.max(m, a.max_streak as number), 0),
    bestEfficiency,
    mpGames: mpResults.length,
    mpWins,
    mpConsecWins,
    dailyStreak,
    xp: (profileRes.data?.xp as number) ?? 0,
  };

  const evaluated = evaluateAchievements(stats);
  const newlyUnlocked = evaluated.filter((a) => a.unlocked && !alreadyUnlocked.has(a.id));

  if (newlyUnlocked.length > 0) {
    await supabase.from("user_achievements").insert(
      newlyUnlocked.map((a) => ({ user_id: userId, achievement_id: a.id })),
    );
  }

  return newlyUnlocked.map(({ id, name, emoji }) => ({ id, name, emoji }));
}
