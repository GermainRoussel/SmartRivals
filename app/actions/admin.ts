"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Question } from "@/types";

async function assertAdmin() {
  const userId = await getUserId();
  if (!userId) throw new Error("Non connecté.");
  // Any authenticated user can manage questions.
  // Set ADMIN_EMAIL env var to restrict to a specific account.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email !== adminEmail) throw new Error("Accès refusé.");
  }
}

export async function insertQuestions(
  questions: Question[],
): Promise<{ inserted: number; errors: string[] }> {
  await assertAdmin();
  const supabase = await createClient();

  const rows = questions.map((q) => ({
    id: q.id,
    type: q.type,
    theme: q.theme,
    difficulty: q.difficulty,
    data: q as unknown as Record<string, unknown>,
  }));

  const { error, data } = await supabase
    .from("custom_questions")
    .upsert(rows, { onConflict: "id" })
    .select("id");

  if (error) return { inserted: 0, errors: [error.message] };
  return { inserted: data?.length ?? 0, errors: [] };
}

export async function getCustomQuestions(): Promise<Question[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_questions")
    .select("data")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.data as Question);
}

export async function deleteCustomQuestion(id: string): Promise<void> {
  await assertAdmin();
  const supabase = await createClient();
  await supabase.from("custom_questions").delete().eq("id", id);
}
