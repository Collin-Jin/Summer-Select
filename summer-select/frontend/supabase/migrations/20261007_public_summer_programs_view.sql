-- Public, read-only projection of published programs for the open Program Directory.
-- Intentionally omits Collin's paid analysis (collin_rationale_*, collin_strategy_*).
-- The base table keeps its paid-only RLS policy; this view runs with the owner's
-- privileges so anonymous and unpaid visitors can read these safe columns only.
create or replace view public.public_summer_programs as
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
  collin_rec_index
from public.summer_programs
where is_published = true;

grant select on public.public_summer_programs to anon, authenticated;
