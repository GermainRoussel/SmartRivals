"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { loadDailyQuestionsForClient } from "@/app/actions/questions";
import { isAnswerCorrect } from "@/lib/quiz/validation";
import { computePoints, nextStreak } from "@/lib/scoring";

const MAX_TIME = 15; // must match the client constant

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

export interface QuestionResult {
  /** Raw answer submitted by the player (undefined for self-validating types). */
  answer?: unknown;
  /** For CHESS / CONNECTIONS (self-validating): client-reported correctness. */
  selfValidated?: boolean;
  /** Seconds remaining when the player answered. Server clamps to [0, MAX_TIME]. */
  timeRemaining: number;
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
 * @deprecated Use submitDailyAttempt for server-authoritative scoring.
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

/**
 * Server-authoritative daily quiz submission (A1).
 *
 * The client sends raw per-question results; the server:
 *   1. Loads today's canonical question set (same deterministic seed).
 *   2. Validates each answer with isAnswerCorrect (or trusts self-validated flag
 *      for CHESS / CONNECTIONS which can't be re-evaluated server-side).
 *   3. Clamps timeRemaining to [0, MAX_TIME] — prevents time-bonus inflation.
 *   4. Recomputes score + streak server-side.
 *   5. Upserts one authoritative row per user per day.
 *
 * Returns the server-computed result so the client can display the official score.
 */
export async function submitDailyAttempt(input: {
  questionResults: Record<string, QuestionResult>;
}): Promise<{ ok: true; result: TodayAttempt } | { error: string }> {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  // Load today's canonical question set on the server.
  const questions = await loadDailyQuestionsForClient();

  let score = 0;
  let correctCount = 0;
  let streak = 0;
  let maxStreak = 0;

  for (const q of questions) {
    const submitted = input.questionResults[q.id];
    if (!submitted) continue; // question was skipped / timed out

    const timeRemaining = Math.max(0, Math.min(MAX_TIME, submitted.timeRemaining));

    let isCorrect: boolean;
    if (submitted.answer !== undefined) {
      // Standard types: re-validate on the server.
      isCorrect = isAnswerCorrect(q, submitted.answer);
    } else {
      // Self-validating types (CHESS, CONNECTIONS): trust the client flag.
      isCorrect = submitted.selfValidated ?? false;
    }

    score += computePoints({ isCorrect, timeRemaining, streak });
    streak = nextStreak(streak, isCorrect);
    if (isCorrect) correctCount++;
    maxStreak = Math.max(maxStreak, streak);
  }

  const total = questions.length;
  const result: TodayAttempt = { score, correctCount, total, maxStreak };

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").upsert(
    {
      user_id: userId,
      score,
      correct_count: correctCount,
      total,
      max_streak: maxStreak,
    },
    { onConflict: "user_id,quiz_date", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };
  return { ok: true, result };
}
