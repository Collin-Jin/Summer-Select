-- Lets the admin delete a member's account from the Members page.
--
-- Deleting the auth user removes everything tied to it: the profile, saved
-- programs (favorites) and blocked sign-in history are removed by cascade, and
-- problem reports they filed are kept with the reporter cleared. The admin
-- cannot delete their own account.
create function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot delete your own account' using errcode = '42501';
  end if;

  delete from auth.users where id = p_user_id;

  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
