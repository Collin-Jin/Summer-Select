-- 1. Member names.
--
-- First and last name are collected at sign-up and stored in the account's
-- metadata (auth.users.raw_user_meta_data), which works even before the e-mail
-- is confirmed. The admin member list now returns them.
drop function if exists public.admin_list_users();

create function public.admin_list_users()
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed boolean,
  has_profile boolean,
  is_paid boolean,
  enforce_device_lock boolean,
  has_active_session boolean,
  notes text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    nullif(btrim(u.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'last_name'), ''),
    u.created_at,
    u.last_sign_in_at,
    (u.email_confirmed_at is not null),
    (p.id is not null),
    coalesce(p.is_paid, false),
    coalesce(p.enforce_device_lock, true),
    (p.active_session_id is not null),
    p.notes
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- 2. Blocked sign-ins.
--
-- When a member with the one-device rule on tries to sign in from a different
-- browser and is turned away, the app records the attempt here so the admin can
-- see it on the Members page. Only the account that was blocked can add a row
-- (as itself); only the admin can read or clear them.
create table public.blocked_sign_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_agent text
    constraint blocked_sign_ins_user_agent_length check (char_length(user_agent) <= 300),
  country text
    constraint blocked_sign_ins_country_length check (char_length(country) <= 10),
  city text
    constraint blocked_sign_ins_city_length check (char_length(city) <= 100)
);

create index blocked_sign_ins_user_created_idx on public.blocked_sign_ins (user_id, created_at desc);

alter table public.blocked_sign_ins enable row level security;

create policy "members record their own blocked sign-in"
  on public.blocked_sign_ins for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "admin full access"
  on public.blocked_sign_ins for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.blocked_sign_ins from public, anon, authenticated, service_role;
grant insert (user_id, user_agent, country, city) on public.blocked_sign_ins to authenticated;
-- Row-level security restricts these to the admin.
grant select, update, delete on public.blocked_sign_ins to authenticated;

-- At most 20 rows per account per hour, so a stuck retry loop cannot fill the table.
create function public.blocked_sign_ins_throttle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.blocked_sign_ins b
    where b.user_id = new.user_id
      and b.created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'Too many blocked sign-ins recorded.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.blocked_sign_ins_throttle() from public, anon, authenticated;

create trigger blocked_sign_ins_throttle
  before insert on public.blocked_sign_ins
  for each row execute function public.blocked_sign_ins_throttle();
