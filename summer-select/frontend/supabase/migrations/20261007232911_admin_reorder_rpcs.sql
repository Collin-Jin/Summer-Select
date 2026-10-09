-- Atomic bulk re-ordering for the admin drag-and-drop "Arrange" screens.
-- Already applied to the production project as migration "admin_reorder_rpcs".
--
-- A drag-and-drop save touches many rows at once; doing it in one function
-- means the new order is either fully applied or not at all.

create or replace function public.admin_reorder_prompts(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.summer_program_prompts p
  set program_order = (i.item ->> 'program_order')::int,
      "order" = (i.item ->> 'order')::int,
      updated_at = now()
  from jsonb_array_elements(p_items) as i(item)
  where p.id = (i.item ->> 'id')::uuid;
end;
$$;

create or replace function public.admin_reorder_interviews(p_guides jsonb, p_questions jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.interview_guides g
  set sort_order = (i.item ->> 'sort_order')::int,
      updated_at = now()
  from jsonb_array_elements(p_guides) as i(item)
  where g.id = (i.item ->> 'id')::uuid;

  update public.interview_questions q
  set sort_order = (i.item ->> 'sort_order')::int
  from jsonb_array_elements(p_questions) as i(item)
  where q.id = (i.item ->> 'id')::uuid;
end;
$$;

revoke all on function public.admin_reorder_prompts(jsonb) from public, anon;
revoke all on function public.admin_reorder_interviews(jsonb, jsonb) from public, anon;
grant execute on function public.admin_reorder_prompts(jsonb) to authenticated;
grant execute on function public.admin_reorder_interviews(jsonb, jsonb) to authenticated;
