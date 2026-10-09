-- My List planner: let each user rate a saved program, keep private notes and
-- track where they are in the application. Deleting a favourite deletes all of
-- this with it (the app asks for confirmation first).
alter table public.favorites
  add column if not exists rating smallint
    constraint favorites_rating_range check (rating between 1 and 5),
  add column if not exists notes text
    constraint favorites_notes_length check (char_length(notes) <= 5000),
  add column if not exists status text not null default 'considering'
    constraint favorites_status_values check (
      status in ('considering', 'applying', 'submitted', 'accepted', 'waitlisted', 'rejected')
    ),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.favorites_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.favorites_touch_updated_at() from public, anon, authenticated;

drop trigger if exists favorites_touch_updated_at on public.favorites;
create trigger favorites_touch_updated_at
  before update on public.favorites
  for each row execute function public.favorites_touch_updated_at();

-- Row-level security already limits every row to its owner. Also remove the
-- privileges the API roles never need (anon has no use for this table, and
-- TRUNCATE / REFERENCES / TRIGGER are not part of the app).
revoke all on public.favorites from anon;
revoke truncate, references, trigger on public.favorites from authenticated;
