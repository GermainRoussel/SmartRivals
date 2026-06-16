-- SmartRivals — Phase 3 schema: realtime multiplayer rooms.

-- ------------------------------------------------------------------ --
--  ROOMS                                                             --
-- ------------------------------------------------------------------ --
create table if not exists public.rooms (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique
                     default upper(substring(md5(random()::text) from 1 for 6)),
  host_id          uuid not null references public.profiles (id) on delete cascade,
  status           text not null default 'lobby'
                     check (status in ('lobby', 'playing', 'finished')),
  is_public        boolean not null default false,
  settings         jsonb not null default '{}'::jsonb,
  question_ids     text[] not null default '{}',
  current_index    integer not null default 0,
  question_ends_at timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.rooms replica identity full;

create policy "rooms readable by authenticated"
  on public.rooms for select to authenticated using (true);
create policy "host creates room"
  on public.rooms for insert to authenticated with check (auth.uid() = host_id);
create policy "host updates room"
  on public.rooms for update to authenticated using (auth.uid() = host_id);
create policy "host deletes room"
  on public.rooms for delete to authenticated using (auth.uid() = host_id);

-- ------------------------------------------------------------------ --
--  ROOM PLAYERS                                                      --
-- ------------------------------------------------------------------ --
create table if not exists public.room_players (
  room_id   uuid not null references public.rooms (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  score     integer not null default 0,
  is_ready  boolean not null default false,
  finished  boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.room_players enable row level security;
alter table public.room_players replica identity full;

create policy "room_players readable by authenticated"
  on public.room_players for select to authenticated using (true);
create policy "join as self"
  on public.room_players for insert to authenticated with check (auth.uid() = user_id);
create policy "update own player row"
  on public.room_players for update to authenticated using (auth.uid() = user_id);
create policy "leave (delete own)"
  on public.room_players for delete to authenticated using (auth.uid() = user_id);

-- ------------------------------------------------------------------ --
--  MATCHMAKING QUEUE                                                 --
-- ------------------------------------------------------------------ --
create table if not exists public.matchmaking_queue (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  settings   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.matchmaking_queue enable row level security;

create policy "own queue select"
  on public.matchmaking_queue for select to authenticated using (auth.uid() = user_id);
create policy "own queue insert"
  on public.matchmaking_queue for insert to authenticated with check (auth.uid() = user_id);
create policy "own queue delete"
  on public.matchmaking_queue for delete to authenticated using (auth.uid() = user_id);

-- ------------------------------------------------------------------ --
--  MATCHMAKING RPC (atomic pair-or-enqueue)                          --
-- ------------------------------------------------------------------ --
create or replace function public.find_or_create_match(p_question_ids text[])
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_me    uuid := auth.uid();
  v_other uuid;
  v_room  uuid;
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;

  -- Grab the oldest waiting opponent, if any.
  select user_id into v_other
  from matchmaking_queue
  where user_id <> v_me
  order by created_at
  limit 1
  for update skip locked;

  if v_other is not null then
    delete from matchmaking_queue where user_id in (v_me, v_other);
    insert into rooms (host_id, is_public, status, question_ids)
      values (v_other, true, 'lobby', p_question_ids)
      returning id into v_room;
    insert into room_players (room_id, user_id)
      values (v_room, v_other), (v_room, v_me);
    return v_room;
  end if;

  -- Otherwise wait in the queue.
  insert into matchmaking_queue (user_id) values (v_me)
    on conflict (user_id) do update set created_at = now();
  return null;
end;
$$;

grant execute on function public.find_or_create_match(text[]) to authenticated;

-- ------------------------------------------------------------------ --
--  REALTIME                                                          --
-- ------------------------------------------------------------------ --
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
