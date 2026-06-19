-- SmartRivals — Anti cold-start: AI opponents / bot mode (B3).
--
-- At launch the matchmaking queue will usually be empty. To guarantee a player
-- always gets a game, the client falls back to a bot opponent after a short
-- wait. Bots are real profiles (flagged is_bot) provisioned by scripts/seed-bots.mjs
-- via the admin API (they need an auth.users row for the profiles FK).
--
-- Honesty: bots are badged in the UI and never write quiz_attempts or
-- match_results, so they never appear on any leaderboard.

-- Flag bot profiles.
alter table public.profiles
  add column if not exists is_bot boolean not null default false;

-- Bot personas: skill knobs read by the client to simulate plausible play.
create table if not exists public.bots (
  id        uuid primary key references public.profiles (id) on delete cascade,
  label     text not null,
  accuracy  real not null default 0.7 check (accuracy between 0 and 1),
  speed     real not null default 0.6 check (speed between 0 and 1),
  created_at timestamptz not null default now()
);

alter table public.bots enable row level security;

-- Personas are readable (the client needs accuracy/speed to drive the bot).
create policy "bots readable by authenticated"
  on public.bots for select to authenticated using (true);

-- ------------------------------------------------------------------ --
--  MATCH WITH A BOT (fallback when the queue is empty)               --
-- ------------------------------------------------------------------ --
-- Returns a new room id, or NULL if the caller is no longer queued
-- (meaning a real player matched them first — caller should ignore).
create or replace function public.match_with_bot(p_question_ids text[])
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_me      uuid := auth.uid();
  v_bot     uuid;
  v_persona jsonb;
  v_room    uuid;
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;

  -- Only fall back to a bot if still waiting; if the row is gone we were
  -- already paired with a real player, so do nothing.
  delete from matchmaking_queue where user_id = v_me;
  if not found then
    return null;
  end if;

  select b.id,
         jsonb_build_object(
           'id', b.id, 'label', b.label,
           'accuracy', b.accuracy, 'speed', b.speed
         )
    into v_bot, v_persona
    from bots b
   order by random()
   limit 1;

  if v_bot is null then
    raise exception 'no bot available';
  end if;

  -- Caller is host (their browser drives question timing, as in a normal game).
  insert into rooms (host_id, is_public, status, question_ids, settings)
    values (v_me, true, 'lobby', p_question_ids, jsonb_build_object('bot', v_persona))
    returning id into v_room;

  insert into room_players (room_id, user_id)
    values (v_room, v_me), (v_room, v_bot);

  return v_room;
end;
$$;

grant execute on function public.match_with_bot(text[]) to authenticated;

-- ------------------------------------------------------------------ --
--  SET BOT SCORE (the human host drives the bot's simulated answers) --
-- ------------------------------------------------------------------ --
-- The bot has no client, so the human player updates its visible score via
-- this definer function (room_players RLS only allows updating one's own row).
-- The caller must be a member of the room; only the bot's row is touched.
create or replace function public.set_bot_score(
  p_room uuid, p_score int, p_answered int
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from room_players where room_id = p_room and user_id = v_me
  ) then
    raise exception 'not a member of this room';
  end if;

  update room_players rp
     set score          = p_score,
         answered_index = greatest(coalesce(rp.answered_index, -1), p_answered)
    from profiles pr
   where rp.room_id = p_room
     and rp.user_id = pr.id
     and pr.is_bot = true;
end;
$$;

grant execute on function public.set_bot_score(uuid, int, int) to authenticated;
