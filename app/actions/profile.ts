"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileUpdate {
  username: string;
  bio: string | null;
  avatar_url: string | null;
}

export async function updateProfile(
  input: ProfileUpdate,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const username = input.username.trim().slice(0, 24);
  if (username.length < 2) return { error: "Le pseudo doit faire au moins 2 caractères." };

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio: input.bio?.trim().slice(0, 200) || null,
      avatar_url: input.avatar_url || null,
      onboarded: true,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "Ce pseudo est déjà pris." };
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}
