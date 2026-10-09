-- Read-only projection of published programs for signed-in users, including
-- Collin's analysis (collin_rationale_*, collin_strategy_*).
--
-- Access tiers for program data:
--   guest      -> public_summer_programs  (no analysis text)
--   registered -> member_summer_programs  (this view: adds the analysis text)
--   paid/admin -> summer_programs         (base table, paid-only RLS policy)
--
-- Like public_summer_programs, this view runs with the owner's privileges so it
-- can read the paid-only base table. It is only granted to `authenticated`, and
-- additionally refuses to return rows unless there is a signed-in user
-- (auth.uid() is read from the request's JWT, not from the view owner).
create or replace view public.member_summer_programs as
select
  lid, created_at, updated_at, is_published, slug,
  name_en, name_zh,
  host_institution_en, host_institution_zh,
  location_city_en, location_city_zh, location_state,
  program_url, logo_url,
  primary_category_en, primary_category_zh,
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

-- Simple views are auto-updatable, and this one runs with the owner's
-- privileges, so any write privilege would bypass RLS on the base table.
-- Grant read access only. (Postgres' default privileges for new objects in
-- `public` include INSERT/UPDATE/DELETE for API roles, hence the explicit revoke.)
revoke all on public.member_summer_programs from public, anon, authenticated, service_role;
grant select on public.member_summer_programs to authenticated;
