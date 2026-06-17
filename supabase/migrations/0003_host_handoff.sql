-- SmartRivals — host handoff: when the host leaves a room, promote the next
-- remaining player so the game doesn't stall (the host drives progression).

create or replace function public.promote_host(p_room uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_new uuid;
begin
  -- No-op while the current host is still a member of the room.
  if exists (
    select 1
    from rooms r
    join room_players rp on rp.room_id = r.id and rp.user_id = r.host_id
    where r.id = p_room
  ) then
    return null;
  end if;

  -- Earliest-joined remaining player becomes the new host.
  select user_id into v_new
  from room_players
  where room_id = p_room
  order by joined_at
  limit 1;

  if v_new is null then
    -- Nobody left → clean up the room.
    delete from rooms where id = p_room;
    return null;
  end if;

  update rooms set host_id = v_new where id = p_room;
  return v_new;
end;
$$;

grant execute on function public.promote_host(uuid) to authenticated;
