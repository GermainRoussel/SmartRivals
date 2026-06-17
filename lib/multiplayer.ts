import { createClient } from "@/lib/supabase/client";

/** Number of questions per multiplayer game and per-question time budget. */
export const MP_QUESTION_COUNT = 5;
export const MP_QUESTION_MS = 15_000;

export type RoomStatus = "lobby" | "playing" | "finished";

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  is_public: boolean;
  settings: Record<string, unknown>;
  question_ids: string[];
  current_index: number;
  question_ends_at: string | null;
  created_at: string;
}

export interface RoomPlayer {
  room_id: string;
  user_id: string;
  score: number;
  is_ready: boolean;
  finished: boolean;
  joined_at: string;
  profiles?: { username: string; avatar_url: string | null } | null;
}

export const PLAYER_SELECT = "*, profiles(username, avatar_url)";

async function uid(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return user.id;
}

export async function createPrivateRoom(questionIds: string[]): Promise<Room> {
  const supabase = createClient();
  const me = await uid();
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ host_id: me, is_public: false, question_ids: questionIds })
    .select()
    .single();
  if (error || !room) throw error ?? new Error("room creation failed");
  await supabase.from("room_players").insert({ room_id: room.id, user_id: me });
  return room as Room;
}

export async function joinByCode(code: string): Promise<Room> {
  const supabase = createClient();
  const me = await uid();
  const { data: room, error } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .eq("status", "lobby")
    .maybeSingle();
  if (error) throw error;
  if (!room) throw new Error("Salle introuvable");
  await supabase
    .from("room_players")
    .upsert({ room_id: room.id, user_id: me }, { onConflict: "room_id,user_id", ignoreDuplicates: true });
  return room as Room;
}

export async function leaveRoom(roomId: string): Promise<void> {
  const supabase = createClient();
  const me = await uid();
  await supabase.from("room_players").delete().eq("room_id", roomId).eq("user_id", me);
}

export async function startGame(roomId: string, questionMs: number): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("rooms")
    .update({
      status: "playing",
      current_index: 0,
      question_ends_at: new Date(Date.now() + questionMs).toISOString(),
    })
    .eq("id", roomId);
}

export async function setScore(roomId: string, score: number): Promise<void> {
  const supabase = createClient();
  const me = await uid();
  await supabase
    .from("room_players")
    .update({ score })
    .eq("room_id", roomId)
    .eq("user_id", me);
}

export async function advanceQuestion(
  roomId: string,
  nextIndex: number,
  total: number,
  questionMs: number,
): Promise<void> {
  const supabase = createClient();
  if (nextIndex >= total) {
    await supabase.from("rooms").update({ status: "finished", question_ends_at: null }).eq("id", roomId);
    return;
  }
  await supabase
    .from("rooms")
    .update({
      current_index: nextIndex,
      question_ends_at: new Date(Date.now() + questionMs).toISOString(),
    })
    .eq("id", roomId);
}

/** Returns a room id if matched immediately, or null if queued. */
export async function findMatch(questionIds: string[]): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("find_or_create_match", {
    p_question_ids: questionIds,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function leaveQueue(): Promise<void> {
  const supabase = createClient();
  const me = await uid();
  await supabase.from("matchmaking_queue").delete().eq("user_id", me);
}

/**
 * Promote the next player to host if the current host has left (idempotent:
 * no-op while the host is still present). Lets the game resume after a host
 * leaves, since the host drives question progression.
 */
export async function promoteHost(roomId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("promote_host", { p_room: roomId });
}
