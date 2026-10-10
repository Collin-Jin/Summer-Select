-- Requests from visitors for a summer program to be added to the directory,
-- triaged by the admin.
create table public.program_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  program_name text not null
    constraint program_requests_name_length check (char_length(btrim(program_name)) between 2 and 150),
  program_url text
    constraint program_requests_url_length check (char_length(program_url) <= 500)
    constraint program_requests_url_scheme check (program_url ~* '^https?://'),
  notes text
    constraint program_requests_notes_length check (char_length(notes) <= 1000),
  requester_email text
    constraint program_requests_email_length check (char_length(requester_email) <= 200),
  user_id uuid references auth.users (id) on delete set null,
  -- Hash of the requester's network address and browser, used only to
  -- limit how many requests one visitor can send.
  client_id text
    constraint program_requests_client_id_length check (char_length(client_id) <= 100),
  status text not null default 'pending'
    constraint program_requests_status_values check (status in ('pending', 'added', 'declined')),
  handled_at timestamptz,
  constraint program_requests_handled_consistent check ((status = 'pending') = (handled_at is null))
);

create index program_requests_status_created_idx on public.program_requests (status, created_at desc);

alter table public.program_requests enable row level security;

-- Anyone may ask for a program (as themselves, or anonymously). Nobody but the
-- admin can read, change or delete requests.
create policy "anyone can request a program"
  on public.program_requests for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

create policy "admin full access"
  on public.program_requests for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.program_requests from public, anon, authenticated, service_role;
-- Requesters may only set these columns (status and timestamps use defaults).
grant insert (program_name, program_url, notes, requester_email, user_id, client_id)
  on public.program_requests to anon, authenticated;
-- Row-level security restricts these to the admin.
grant select, update, delete on public.program_requests to authenticated;

-- Throttle: 5 requests per visitor per day and 100 per hour overall, so the open
-- form cannot be used to flood the table. The admin is exempt.
create or replace function public.program_requests_throttle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  if public.is_admin() then
    return new;
  end if;

  select count(*) into recent
  from public.program_requests r
  where r.created_at > now() - interval '1 day'
    and (
      (new.user_id is not null and r.user_id = new.user_id)
      or (new.client_id is not null and r.client_id = new.client_id)
    );
  if recent >= 5 then
    raise exception 'Too many requests. Please try again later.' using errcode = 'P0001';
  end if;

  select count(*) into recent
  from public.program_requests r
  where r.created_at > now() - interval '1 hour';
  if recent >= 100 then
    raise exception 'Too many requests. Please try again later.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.program_requests_throttle() from public, anon, authenticated;

create trigger program_requests_throttle
  before insert on public.program_requests
  for each row execute function public.program_requests_throttle();
