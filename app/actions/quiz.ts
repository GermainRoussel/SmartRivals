"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";

export interface DailyAttemptInput {
  score: number;
  correctCount: number;
  total: number;
  maxStreak: number;
}

export interface TodayAttempt {
  score: number;
  correctCount: number;
  total: number;
  maxStreak: number;
}

/**
 * Return the current user's quiz attempt for today, or null if they haven't
 * played yet (or are not signed in / Supabase is unconfigured).
 */
export async function getTodayAttempt(): Promise<TodayAttempt | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("quiz_attempts")
    .select("score, correct_count, total, max_streak")
    .eq("user_id", userId)
    .eq("quiz_date", today)
    .maybeSingle();

  if (!data) return null;
  return {
    score: data.score as number,
    correctCount: data.correct_count as number,
    total: data.total as number,
    maxStreak: data.max_streak as number,
  };
}

/**
 * Persist the day's quiz result. No-op when the player isn't signed in (or
 * Supabase isn't configured). At most one attempt per user per day is kept.
 */
export async function saveDailyAttempt(
  input: DailyAttemptInput,
): Promise<{ saved: boolean }> {
  const userId = await getUserId();
  if (!userId) return { saved: false };

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").upsert(
    {
      user_id: userId,
      score: input.score,
      correct_count: input.correctCount,
      total: input.total,
      max_streak: input.maxStreak,
    },
    { onConflict: "user_id,quiz_date", ignoreDuplicates: true },
  );

  return { saved: !error };
}
