-- SmartRivals — Phase 2 schema: profiles, daily quiz attempts, leaderboard.
-- Apply with `supabase db push` or by pasting into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ --
--  PROFILES                                                          --
-- ------------------------------------------------------------------ --
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  avatar_url text,
  xp         integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone (authenticated) can read profiles — needed for the leaderboard.
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-provision a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ --
--  DAILY QUIZ ATTEMPTS                                               --
-- ------------------------------------------------------------------ --
create table if not exists public.quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  quiz_date     date not null default current_date,
  score         integer not null,
  correct_count integer not null,
  total         integer not null,
  max_streak    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_date_idx on public.quiz_attempts (quiz_date);

-- One recorded daily attempt per user per day.
create unique index if not exists quiz_attempts_one_per_day
  on public.quiz_attempts (user_id, quiz_date);

create policy "Attempts are viewable by everyone"
  on public.quiz_attempts for select using (true);

create policy "Users insert their own attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------------ --
--  WEEKLY LEADERBOARD (view)                                         --
-- ------------------------------------------------------------------ --
create or replace view public.weekly_leaderboard
with (security_invoker = true) as
select
  p.id,
  p.username,
  p.avatar_url,
  sum(qa.score)::int   as total_score,
  count(qa.id)::int    as games_played
from public.profiles p
join public.quiz_attempts qa
  on qa.user_id = p.id
 and qa.created_at >= date_trunc('week', now())
group by p.id, p.username, p.avatar_url
order by total_score desc;

grant select on public.weekly_leaderboard to anon, authenticated;
