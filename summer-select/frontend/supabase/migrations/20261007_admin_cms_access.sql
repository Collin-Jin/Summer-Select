-- Admin CMS access.
--
-- Lets the site owner edit all site content from the website itself (the /admin
-- area). Enforcement lives in the database, so the UI check can never be the only
-- line of defence.
--
-- The admin email below MUST stay in sync with lib/admin/config.ts.
-- Already applied to the production project as migration "admin_cms_access".

-- ── Who is the admin? ───────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'collinjin2029@u.northwestern.edu'
$$;

-- ── Full read/write on every content table for the admin ────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'summer_programs',
    'summer_program_prompts',
    'program_example_essays',
    'interview_guides',
    'interview_questions',
    'program_documents'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I for all to authenticated '
      'using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
  end loop;
end $$;

-- ── AI reference essays: only paid members (and the admin) can search them ──
create or replace function public.match_documents(
  query_embedding vector,
  match_threshold double precision,
  match_count integer
)
returns table (id bigint, content text, similarity double precision)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not (
    public.is_admin()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_paid = true)
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select d.id, d.content, 1 - (d.embedding <=> query_embedding) as similarity
  from public.program_documents d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

revoke all on function public.match_documents(vector, double precision, integer) from public, anon, authenticated;
grant execute on function public.match_documents(vector, double precision, integer) to authenticated, service_role;

-- ── Member management (profiles are private, so this goes through RPCs) ─────
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
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

create or replace function public.admin_update_user(
  p_user_id uuid,
  p_is_paid boolean,
  p_enforce_device_lock boolean,
  p_notes text,
  p_reset_session boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  -- Profile rows are created on demand (most accounts start without one).
  insert into public.profiles (id, is_paid, enforce_device_lock, notes)
  values (p_user_id, p_is_paid, p_enforce_device_lock, nullif(btrim(p_notes), ''))
  on conflict (id) do update set
    is_paid = excluded.is_paid,
    enforce_device_lock = excluded.enforce_device_lock,
    notes = excluded.notes,
    active_session_id = case when p_reset_session then null else public.profiles.active_session_id end;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_update_user(uuid, boolean, boolean, text, boolean) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_update_user(uuid, boolean, boolean, text, boolean) to authenticated;
