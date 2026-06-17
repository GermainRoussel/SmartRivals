-- SmartRivals — multiplayer match history (one row per player per finished game).

create table if not exists public.match_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  room_id       uuid references public.rooms (id) on delete set null,
  score         integer not null,
  rank          integer not null,
  total_players integer not null,
  won           boolean not null default false,
  played_at     timestamptz not null default now()
);

alter table public.match_results enable row level security;

create index if not exists match_results_user_idx
  on public.match_results (user_id, played_at desc);

create policy "own match results select"
  on public.match_results for select to authenticated using (auth.uid() = user_id);

create policy "own match results insert"
  on public.match_results for insert to authenticated with check (auth.uid() = user_id);
