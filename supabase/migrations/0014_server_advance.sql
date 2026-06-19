-- SmartRivals — Server-authoritative multiplayer question advance (B2).
--
-- Problem: the host's browser drives question timing via setTimeout. If the host
-- disconnects mid-game, the timer stops and the room stalls forever.
--
-- Solution: a pg_cron job (safety net, fires every minute) that advances any
-- playing room whose question_ends_at has passed. The client-side host timer
-- remains the primary driver; this function only kicks in when all browsers
-- have disconnected or the promoted host hasn't picked up yet.
--
-- Prerequisite: enable pg_cron in Supabase dashboard → Database → Extensions.

-- Idempotent extension enable (noop if already enabled).
create extension if not exists pg_cron schema extensions;

-- Advance all stale rooms by one question step.
-- "Stale" = status 'playing' with question_ends_at > 1 s in the past.
-- Uses FOR UPDATE SKIP LOCKED so concurrent invocations are safe.
create or replace function public.advance_stale_rooms()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r      record;
  q_total int;
begin
  for r in
    select id, current_index, array_length(question_ids, 1) as q_total
      from rooms
     where status = 'playing'
       and question_ends_at is not null
       and question_ends_at < now() - interval '1 second'
     for update skip locked
  loop
    q_total := r.q_total;
    if r.current_index + 1 >= q_total then
      update rooms
         set status           = 'finished',
             question_ends_at = null
       where id = r.id;
    else
      update rooms
         set current_index    = r.current_index + 1,
             question_ends_at = now() + interval '15 seconds'
       where id = r.id;
    end if;
  end loop;
end;
$$;

-- Register the cron job (idempotent: skip if already exists).
do $$
begin
  if not exists (
    select from cron.job where jobname = 'sr-advance-stale-rooms'
  ) then
    perform cron.schedule(
      'sr-advance-stale-rooms',
      '* * * * *',
      'select public.advance_stale_rooms()'
    );
  end if;
end;
$$;
