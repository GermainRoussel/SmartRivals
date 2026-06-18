"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import {
  pickQuestionIds,
  getQuestionsByIds,
  todayKey,
} from "@/lib/quiz/bank";
import { Question } from "@/types";

/** Fetch the set of question IDs marked inactive in question_overrides. */
export async function getDisabledIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_overrides")
    .select("question_id")
    .eq("active", false);
  return (data ?? []).map((r) => r.question_id as string);
}

/** Fetch all overrides as a map { question_id → active }. */
export async function getOverridesMap(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_overrides")
    .select("question_id, active");
  return Object.fromEntries(
    (data ?? []).map((r) => [r.question_id as string, r.active as boolean]),
  );
}

/** Toggle a question's active state (upsert into question_overrides). */
export async function setQuestionActive(id: string, active: boolean): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("Non connecté.");
  const supabase = await createClient();
  await supabase
    .from("question_overrides")
    .upsert({ question_id: id, active, updated_at: new Date().toISOString() });
}

/**
 * Server-side daily question loader — respects question_overrides so that
 * disabled questions are never served.
 * Also merges DB custom_questions into the selection pool (DB wins on same ID).
 */
export async function loadDailyQuestionsForClient(): Promise<Question[]> {
  const supabase = await createClient();

  const [disabledRes, customRes] = await Promise.all([
    getDisabledIds(),
    supabase.from("custom_questions").select("data"),
  ]);

  const disabled = new Set(disabledRes);

  // DB custom questions (admin-imported), also filtered by override.
  const dbQuestions: Question[] = (customRes.data ?? [])
    .map((r) => r.data as Question)
    .filter((q) => !disabled.has(q.id));

  // Build a map of DB questions by ID so they override in-code duplicates.
  const dbById = new Map(dbQuestions.map((q) => [q.id, q]));

  const ids = pickQuestionIds(todayKey(), 10, disabled);
  // Replace in-code questions with DB overrides where applicable.
  const questions = getQuestionsByIds(ids).map((q) => dbById.get(q.id) ?? q);

  // Append any DB questions whose type isn't already represented.
  const coveredTypes = new Set(questions.map((q) => q.type));
  for (const q of dbQuestions) {
    if (!coveredTypes.has(q.type) && !disabled.has(q.id)) {
      questions.push(q);
      coveredTypes.add(q.type);
    }
  }

  return questions.slice(0, 10);
}
