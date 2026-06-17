-- SmartRivals — profile depth: bio, server-side XP awards, avatar storage.

-- Optional free-text bio.
alter table public.profiles add column if not exists bio text;

-- ------------------------------------------------------------------ --
--  XP awards (server-authoritative, via triggers)                     --
-- ------------------------------------------------------------------ --
-- Daily quiz: XP scales with the score (min 10).
create or replace function public.award_quiz_xp()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles
    set xp = xp + greatest(10, (new.score / 10)::int)
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_quiz_attempt_xp on public.quiz_attempts;
create trigger on_quiz_attempt_xp
  after insert on public.quiz_attempts
  for each row execute function public.award_quiz_xp();

-- Multiplayer: participation + win bonus.
create or replace function public.award_match_xp()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles
    set xp = xp + 25 + case when new.won then 50 else 0 end
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_match_result_xp on public.match_results;
create trigger on_match_result_xp
  after insert on public.match_results
  for each row execute function public.award_match_xp();

-- ------------------------------------------------------------------ --
--  Avatar storage (public-read bucket, owner-write by folder)         --
-- ------------------------------------------------------------------ --
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatar owner insert" on storage.objects;
create policy "avatar owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar owner delete" on storage.objects;
create policy "avatar owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
