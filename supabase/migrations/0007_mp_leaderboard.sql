-- SmartRivals — multiplayer leaderboard.
--
-- match_results carries own-only RLS (a player may read only their own match
-- rows). To build a global "Top Joueurs Multi" board we expose an AGGREGATE view
-- that runs as its owner (security_invoker = false, the Postgres default for
-- views) so it can sum everyone's results — while revealing only per-player
-- totals (games / wins / score), never individual match rows. Same spirit as
-- weekly_leaderboard, but that one stays security_invoker because quiz_attempts
-- is world-readable; match_results is not, hence the definer view here.

create or replace view public.mp_leaderboard
with (security_invoker = false) as
select
  p.id,
  p.username,
  p.avatar_url,
  count(mr.id)::int                      as games,
  coalesce(sum((mr.won)::int), 0)::int   as wins,
  coalesce(sum(mr.score), 0)::int        as total_score
from public.profiles p
join public.match_results mr on mr.user_id = p.id
group by p.id, p.username, p.avatar_url
order by wins desc, total_score desc;

grant select on public.mp_leaderboard to anon, authenticated;
