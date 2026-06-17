import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  xp: number;
}

/** Current authenticated user id, or null (also null when Supabase is unconfigured). */
export async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Current user's profile, or null. */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, xp")
    .eq("id", user.id)
    .single();

  return data ?? null;
}
