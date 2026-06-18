-- SmartRivals — RGPD: account deletion helper.
--
-- The actual deletion is performed by the admin client (service role) in
-- app/actions/account.ts via auth.admin.deleteUser(), which cascades via FK:
--   auth.users → profiles → quiz_attempts, match_results, room_players
--   auth.users → user_achievements (direct FK)
--
-- This migration only ensures the quiz_attempts upsert policy also allows
-- the ignoreDuplicates path (already set), and that match_results has
-- a matching delete policy for the user's own rows.

-- Allow users to delete their own match_results (needed for data cleanup fallback).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'match_results' and policyname = 'own match results delete'
  ) then
    execute $policy$
      create policy "own match results delete"
        on public.match_results for delete to authenticated
        using (auth.uid() = user_id)
    $policy$;
  end if;
end;
$$;

-- Allow users to delete their own quiz_attempts (fallback, normally cascade handles it).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'quiz_attempts' and policyname = 'own attempts delete'
  ) then
    execute $policy$
      create policy "own attempts delete"
        on public.quiz_attempts for delete to authenticated
        using (auth.uid() = user_id)
    $policy$;
  end if;
end;
$$;
