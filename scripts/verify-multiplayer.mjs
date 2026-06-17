// End-to-end smoke test of Phase 3 realtime multiplayer with two real users.
// Verifies RLS + Realtime (join / start / score sync) + the matchmaking RPC,
// then deletes the temp users. Run:
//   node --env-file=.env.local scripts/verify-multiplayer.mjs
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const log = (s, ok, extra = "") => console.log(`${ok ? "✅" : "❌"} ${s}${extra ? " — " + extra : ""}`);

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

function waitFor(timeoutMs) {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  const timer = setTimeout(() => resolve(false), timeoutMs);
  return { promise, hit: () => { clearTimeout(timer); resolve(true); } };
}

async function mkUser(name) {
  const email = `mp_${name}_${Date.now()}@smartrivals.dev`;
  const password = "Test123456!";
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { username: name },
  });
  if (error) throw error;
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  await client.auth.signInWithPassword({ email, password });
  const { data: { session } } = await client.auth.getSession();
  client.realtime.setAuth(session.access_token); // propagate token to the realtime socket
  return { id: data.user.id, client };
}

const A = await mkUser("AliceMP");
const B = await mkUser("BobMP");
let ok = true;

try {
  // 1. A creates a private room + joins.
  const { data: room } = await A.client
    .from("rooms").insert({ host_id: A.id, is_public: false, question_ids: ["mcq-1", "tf-1"] })
    .select().single();
  await A.client.from("room_players").insert({ room_id: room.id, user_id: A.id });
  log("A creates room", !!room, room?.code);

  // 2. Both subscribe (await SUBSCRIBED, surface channel errors).
  const joinEv = waitFor(8000);
  const scoreEv = waitFor(8000);
  const startEv = waitFor(8000);

  const awaitSub = (channel, label) =>
    new Promise((resolve, reject) =>
      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") resolve();
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          reject(new Error(`${label}: ${status} ${err?.message ?? err ?? ""}`));
      }),
    );

  await awaitSub(
    A.client.channel(`a:${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` },
        (p) => { if (p.new.user_id === B.id) joinEv.hit(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room_players", filter: `room_id=eq.${room.id}` },
        (p) => { if (p.new.user_id === B.id && p.new.score === 230) scoreEv.hit(); }),
    "A channel",
  );
  await awaitSub(
    B.client.channel(`b:${room.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (p) => { if (p.new.status === "playing") startEv.hit(); }),
    "B channel",
  );

  // 3. B joins -> A should receive it in realtime.
  await B.client.from("room_players").insert({ room_id: room.id, user_id: B.id });
  log("realtime: A sees B join", await joinEv.promise);

  // 4. A starts the game -> B should see status=playing.
  await A.client.from("rooms").update({ status: "playing", current_index: 0, question_ends_at: new Date(Date.now() + 15000).toISOString() }).eq("id", room.id);
  log("realtime: B sees game start", await startEv.promise);

  // 5. B updates score -> A should see it live.
  await B.client.from("room_players").update({ score: 230 }).eq("room_id", room.id).eq("user_id", B.id);
  log("realtime: A sees B's score update", await scoreEv.promise);

  // 6. Matchmaking RPC: A queues, B matches.
  const { data: r1 } = await A.client.rpc("find_or_create_match", { p_question_ids: ["mcq-1"] });
  const { data: r2 } = await B.client.rpc("find_or_create_match", { p_question_ids: ["mcq-1"] });
  const { data: mmPlayers } = await admin.from("room_players").select("user_id").eq("room_id", r2 ?? "");
  log("matchmaking RPC pairs two players", r1 === null && !!r2 && (mmPlayers?.length === 2), `queued=${r1}, matched=${!!r2}, players=${mmPlayers?.length}`);

  // 7. Host handoff: A hosts, both join, A leaves -> B promotes itself to host.
  const { data: hRoom } = await A.client
    .from("rooms").insert({ host_id: A.id, is_public: false, question_ids: ["mcq-1"] }).select().single();
  await A.client.from("room_players").insert({ room_id: hRoom.id, user_id: A.id });
  await B.client.from("room_players").insert({ room_id: hRoom.id, user_id: B.id });
  await A.client.from("room_players").delete().eq("room_id", hRoom.id).eq("user_id", A.id); // host leaves
  const { data: newHost } = await B.client.rpc("promote_host", { p_room: hRoom.id });
  const { data: after } = await admin.from("rooms").select("host_id").eq("id", hRoom.id).maybeSingle();
  log("host handoff promotes the remaining player", newHost === B.id && after?.host_id === B.id, `newHost=${newHost === B.id}`);

  // 8. Match history: B records a result; B sees it, A cannot (RLS own-only).
  await B.client.from("match_results").insert({ user_id: B.id, room_id: hRoom.id, score: 500, rank: 1, total_players: 2, won: true });
  const { data: bRows } = await B.client.from("match_results").select("score").eq("user_id", B.id);
  const { data: aSeesB } = await A.client.from("match_results").select("score").eq("user_id", B.id);
  log("match history: own visible, others hidden by RLS", (bRows?.length ?? 0) >= 1 && (aSeesB?.length ?? 0) === 0, `b=${bRows?.length}, aSeesB=${aSeesB?.length}`);
} catch (e) {
  ok = false;
  console.error("ERROR:", e.message);
} finally {
  await admin.auth.admin.deleteUser(A.id).catch(() => {});
  await admin.auth.admin.deleteUser(B.id).catch(() => {});
  log("cleanup temp users", true);
  process.exit(ok ? 0 : 1);
}
