-- Remove the program category (primary_category_en / primary_category_zh).
--
-- The two read-only views select these columns, and a view cannot lose a column
-- with `create or replace`, so both are dropped and recreated without them.
-- The privileges are re-applied exactly as in the earlier view migrations: read
-- access only (the views run with the owner's privileges, so any write privilege
-- would bypass row-level security on summer_programs).
drop view if exists public.public_summer_programs;
drop view if exists public.member_summer_programs;

alter table public.summer_programs
  drop column if exists primary_category_en,
  drop column if exists primary_category_zh;

create view public.public_summer_programs as
select
  lid, created_at, updated_at, is_published, slug,
  name_en, name_zh,
  host_institution_en, host_institution_zh,
  location_city_en, location_city_zh, location_state,
  program_url, logo_url,
  offered_disciplines_en, offered_disciplines_zh,
  format_en, format_zh,
  duration_weeks,
  application_open_date, priority_deadline, regular_deadline, is_rolling_admission,
  program_start_date, program_end_date,
  application_fee, tuition_cost, financial_aid_available,
  is_paid_stipend, stipend_amount,
  eligible_grades, international_eligible, minimum_gpa, acceptance_rate,
  requires_essay, essays_required_en, essays_required_zh,
  has_interview,
  collin_rec_index
from public.summer_programs
where is_published = true;

revoke all on public.public_summer_programs from public, anon, authenticated, service_role;
grant select on public.public_summer_programs to anon, authenticated;

create view public.member_summer_programs as
select
  lid, created_at, updated_at, is_published, slug,
  name_en, name_zh,
  host_institution_en, host_institution_zh,
  location_city_en, location_city_zh, location_state,
  program_url, logo_url,
  offered_disciplines_en, offered_disciplines_zh,
  format_en, format_zh,
  duration_weeks,
  application_open_date, priority_deadline, regular_deadline, is_rolling_admission,
  program_start_date, program_end_date,
  application_fee, tuition_cost, financial_aid_available,
  is_paid_stipend, stipend_amount,
  eligible_grades, international_eligible, minimum_gpa, acceptance_rate,
  requires_essay, essays_required_en, essays_required_zh,
  has_interview,
  collin_rec_index,
  collin_rationale_en, collin_rationale_zh,
  collin_strategy_en, collin_strategy_zh
from public.summer_programs
where is_published = true
  and auth.uid() is not null;

revoke all on public.member_summer_programs from public, anon, authenticated, service_role;
grant select on public.member_summer_programs to authenticated;
