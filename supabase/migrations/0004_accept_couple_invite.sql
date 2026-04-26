create or replace function public.accept_couple_invite(invite_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  invite_record record;
begin
  if current_user_id is null then
    return 'login_required';
  end if;

  select id, couple_id, status, expires_at
  into invite_record
  from public.couple_invites
  where token = invite_token
  for update;

  if not found then
    return 'invalid_invite';
  end if;

  if exists (
    select 1
    from public.couple_members
    where couple_id = invite_record.couple_id
    and user_id = current_user_id
  ) then
    return 'already_member';
  end if;

  if invite_record.status <> 'pending' then
    return 'unavailable_invite';
  end if;

  if invite_record.expires_at <= now() then
    update public.couple_invites
    set status = 'expired'
    where id = invite_record.id;

    return 'expired_invite';
  end if;

  insert into public.couple_members (couple_id, user_id, role)
  values (invite_record.couple_id, current_user_id, 'lite')
  on conflict (couple_id, user_id) do nothing;

  update public.couple_invites
  set status = 'accepted',
      accepted_by = current_user_id
  where id = invite_record.id;

  return 'accepted';
end;
$$;

grant execute on function public.accept_couple_invite(text) to authenticated;
