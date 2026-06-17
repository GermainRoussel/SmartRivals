-- SmartRivals — early question advance.
--
-- Track which question index each player has already answered, so the host can
-- skip the rest of the countdown and move on as soon as everyone has answered.
-- A player has answered the current question iff answered_index = rooms.current_index.

alter table public.room_players
  add column if not exists answered_index integer not null default -1;
