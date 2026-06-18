"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { evaluateAchievements, computeDailyStreak, type PlayerStats } from "@/lib/achievements";

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

  // Gather stats — same shape as profile/page.tsx.
  const [attemptsRes, mpWinsRes, mpGamesRes, alreadyRes] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("score, correct_count, total, max_streak, quiz_date")
      .eq("user_id", userId),
    supabase
      .from("match_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("won", true),
    supabase
      .from("match_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
  ]);

  const attempts = attemptsRes.data ?? [];
  const alreadyUnlocked = new Set((alreadyRes.data ?? []).map((r) => r.achievement_id));

  const dailyStreak = computeDailyStreak(attempts.map((a) => a.quiz_date as string));
  const stats: PlayerStats = {
    quizGames: attempts.length,
    perfectQuiz: attempts.some((a) => a.correct_count === a.total),
    bestQuizStreak: attempts.reduce((m, a) => Math.max(m, a.max_streak as number), 0),
    mpGames: mpGamesRes.count ?? 0,
    mpWins: mpWinsRes.count ?? 0,
    dailyStreak,
    xp: 0, // XP from profile — not needed for most predicates; fetch if required
  };

  // Fetch XP separately (the profile.xp field).
  const { data: profileData } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .maybeSingle();
  stats.xp = (profileData?.xp as number) ?? 0;

  const evaluated = evaluateAchievements(stats);
  const newlyUnlocked = evaluated.filter(
    (a) => a.unlocked && !alreadyUnlocked.has(a.id),
  );

  if (newlyUnlocked.length > 0) {
    await supabase.from("user_achievements").insert(
      newlyUnlocked.map((a) => ({ user_id: userId, achievement_id: a.id })),
    );
  }

  return newlyUnlocked.map(({ id, name, emoji }) => ({ id, name, emoji }));
}
