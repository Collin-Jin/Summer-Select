-- Security fix for public_summer_programs.
--
-- The view is auto-updatable and runs with the owner's privileges, but the
-- original migration only added `grant select`: Postgres' default privileges for
-- new objects in `public` had already given anon/authenticated INSERT, UPDATE,
-- DELETE and TRUNCATE on it. Through an owner-privileged view those writes would
-- bypass the row-level security on summer_programs.
--
-- Make the view read-only for every API role.
revoke all on public.public_summer_programs from public, anon, authenticated, service_role;
grant select on public.public_summer_programs to anon, authenticated;
