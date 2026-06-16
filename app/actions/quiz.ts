"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";

export interface DailyAttemptInput {
  score: number;
  correctCount: number;
  total: number;
  maxStreak: number;
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
