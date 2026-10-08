-- Untouched ("original") versions of the example essays.
--
-- The essays shown to members in program_example_essays are edited to protect
-- student privacy. The admin keeps the unedited originals here so they can be
-- compared side by side on the website (admin-only "Originals" tab).
--
-- This is deliberately a SEPARATE table: program_example_essays is readable by
-- members, so a column there would leak the originals. This table has RLS with
-- a single admin-only policy and no grants to anon, so nobody else can read it.
--
-- The admin email is defined in public.is_admin() (see 20261007_admin_cms_access.sql).
-- Already applied to the production project as migration "essay_originals".

create table if not exists public.essay_originals (
  essay_id      uuid primary key
                references public.program_example_essays (id) on delete cascade,
  original_text text not null default '',
  updated_at    timestamptz not null default now()
);

alter table public.essay_originals enable row level security;

drop policy if exists "admin full access" on public.essay_originals;
create policy "admin full access" on public.essay_originals
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Default privileges also hand out TRUNCATE (which bypasses RLS), so strip
-- everything and grant back only the four DML rights (still filtered by RLS).
revoke all on public.essay_originals from anon, authenticated, public;
grant select, insert, update, delete on public.essay_originals to authenticated;
