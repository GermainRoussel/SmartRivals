"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

/**
 * RGPD — permanently delete the current user's account.
 *
 * auth.admin.deleteUser() removes the auth.users row, which cascades via FK to:
 *   profiles → quiz_attempts, match_results, room_players
 *   user_achievements (direct FK on auth.users)
 *
 * After deletion, the Supabase session is invalidated and the user is
 * redirected to /login.
 */
export async function deleteAccount(): Promise<{ error: string } | never> {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  // Use service-role client to bypass RLS and delete the auth user.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return { error: error.message };

  // Sign out the session (best-effort; the row is already gone).
  const supabase = await createClient();
  await supabase.auth.signOut().catch(() => {});

  redirect("/login");
}

/**
 * RGPD — export all data owned by the current user as a JSON blob.
 * Returns a stringified JSON object the client can download as a file.
 */
export async function exportMyData(): Promise<{ ok: true; json: string } | { error: string }> {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = await createClient();

  const [profileRes, attemptsRes, matchesRes, achievementsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("quiz_attempts").select("*").eq("user_id", userId),
    supabase.from("match_results").select("*").eq("user_id", userId),
    supabase.from("user_achievements").select("*").eq("user_id", userId),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profileRes.data,
    quizAttempts: attemptsRes.data ?? [],
    matchResults: matchesRes.data ?? [],
    achievements: achievementsRes.data ?? [],
  };

  return { ok: true, json: JSON.stringify(payload, null, 2) };
}
