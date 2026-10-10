-- 1. Which programs have accepted example essays?
--
-- The essays themselves are for paid members only (row-level security on
-- program_example_essays). This function exposes only how many published essays
-- and prompts each program has, so the program page can show a link to them to
-- everybody without revealing any essay text.
create or replace function public.programs_with_essays()
returns table (program_slug text, prompt_count integer, essay_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.program_slug,
    count(distinct p.id)::integer as prompt_count,
    count(e.id)::integer as essay_count
  from public.summer_program_prompts p
  join public.program_example_essays e on e.prompt_id = p.id
  where p.is_published = true
    and e.is_published is not false
  group by p.program_slug
$$;

revoke all on function public.programs_with_essays() from public;
grant execute on function public.programs_with_essays() to anon, authenticated;

-- 2. Problem reports from visitors, triaged by the admin.
create table public.error_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null
    constraint error_reports_message_length check (char_length(btrim(message)) between 3 and 2000),
  page_url text
    constraint error_reports_page_url_length check (char_length(page_url) <= 500),
  reporter_email text
    constraint error_reports_email_length check (char_length(reporter_email) <= 200),
  user_id uuid references auth.users (id) on delete set null,
  -- Hash of the reporter's network address and browser, used only to
  -- limit how many reports one visitor can send.
  client_id text
    constraint error_reports_client_id_length check (char_length(client_id) <= 100),
  status text not null default 'open'
    constraint error_reports_status_values check (status in ('open', 'resolved')),
  resolved_at timestamptz,
  constraint error_reports_resolved_consistent check ((status = 'resolved') = (resolved_at is not null))
);

create index error_reports_status_created_idx on public.error_reports (status, created_at desc);

alter table public.error_reports enable row level security;

-- Anyone may file a report (as themselves, or anonymously). Nobody but the
-- admin can read, change or delete them.
create policy "anyone can report a problem"
  on public.error_reports for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

create policy "admin full access"
  on public.error_reports for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.error_reports from public, anon, authenticated, service_role;
-- Reporters may only set these columns (status and timestamps use defaults).
grant insert (message, page_url, reporter_email, user_id, client_id) on public.error_reports to anon, authenticated;
-- Row-level security restricts these to the admin.
grant select, update, delete on public.error_reports to authenticated;

-- Throttle: 5 reports per visitor per hour and 100 per hour overall, so the open
-- form cannot be used to flood the table. The admin is exempt.
create or replace function public.error_reports_throttle()
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
  from public.error_reports r
  where r.created_at > now() - interval '1 hour'
    and (
      (new.user_id is not null and r.user_id = new.user_id)
      or (new.client_id is not null and r.client_id = new.client_id)
    );
  if recent >= 5 then
    raise exception 'Too many reports. Please try again later.' using errcode = 'P0001';
  end if;

  select count(*) into recent
  from public.error_reports r
  where r.created_at > now() - interval '1 hour';
  if recent >= 100 then
    raise exception 'Too many reports. Please try again later.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.error_reports_throttle() from public, anon, authenticated;

create trigger error_reports_throttle
  before insert on public.error_reports
  for each row execute function public.error_reports_throttle();
