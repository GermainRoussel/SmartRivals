"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Room, RoomPlayer, PLAYER_SELECT } from "@/lib/multiplayer";

/** Live room state: subscribes to the room row and its players. */
export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("room_players")
      .select(PLAYER_SELECT)
      .eq("room_id", roomId)
      .order("joined_at");
    setPlayers((data as RoomPlayer[]) ?? []);
  }, [roomId]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Ensure the realtime socket carries the auth token before subscribing.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      if (active) setMe(user?.id ?? null);
      const { data: r } = await supabase.from("rooms").select().eq("id", roomId).maybeSingle();
      if (active) {
        setRoom((r as Room) ?? null);
        setLoading(false);
      }
      await fetchPlayers();
      if (!active) return;

      channel = supabase
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
          (payload) => {
            if (payload.eventType === "DELETE") setRoom(null);
            else setRoom(payload.new as Room);
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
          () => {
            void fetchPlayers();
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId, fetchPlayers]);

  return { room, players, me, loading };
}
