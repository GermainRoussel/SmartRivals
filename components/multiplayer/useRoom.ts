"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Room, RoomPlayer, PLAYER_SELECT, promoteHost } from "@/lib/multiplayer";

/** Live room state: subscribes to the room row, its players, and presence. */
export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  const hostIdRef = useRef<string | null>(null);
  const promotingRef = useRef(false);

  useEffect(() => {
    if (room) hostIdRef.current = room.host_id;
  }, [room]);

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
    let dataChannel: ReturnType<typeof supabase.channel> | null = null;
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      const userId = user?.id ?? null;
      if (active) setMe(userId);

      const { data: r } = await supabase.from("rooms").select().eq("id", roomId).maybeSingle();
      if (active) {
        setRoom((r as Room) ?? null);
        setLoading(false);
      }
      await fetchPlayers();
      if (!active) return;

      // ── Postgres changes channel ──────────────────────────────────────────
      dataChannel = supabase
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
          () => { void fetchPlayers(); },
        )
        .subscribe();

      // ── Presence channel ──────────────────────────────────────────────────
      // Tracks who actually has the tab open. Lets us promote a new host the
      // moment the current host's tab closes, without waiting for a DB cleanup.
      presenceChannel = supabase.channel(`presence:${roomId}`);
      presenceChannel
        .on("presence", { event: "sync" }, () => {
          if (!active) return;
          type PresenceEntry = { user_id: string };
          const state = presenceChannel!.presenceState<PresenceEntry>();
          const ids = new Set(
            Object.values(state)
              .flat()
              .map((p) => p.user_id),
          );
          setOnlineIds(ids);
        })
        .on("presence", { event: "leave" }, ({ leftPresences }) => {
          const gone = (leftPresences as unknown as { user_id: string }[]).map((p) => p.user_id);
          const hostId = hostIdRef.current;
          if (hostId && gone.includes(hostId) && !promotingRef.current) {
            promotingRef.current = true;
            void promoteHost(roomId).finally(() => {
              promotingRef.current = false;
            });
          }
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && userId) {
            await presenceChannel!.track({ user_id: userId });
          }
        });
    })();

    return () => {
      active = false;
      if (dataChannel) void supabase.removeChannel(dataChannel);
      if (presenceChannel) void supabase.removeChannel(presenceChannel);
    };
  }, [roomId, fetchPlayers]);

  return { room, players, me, loading, onlineIds };
}
