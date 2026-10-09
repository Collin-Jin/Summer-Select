# Supabase schema

The app expects a Supabase project with the objects below. Row-Level Security is enabled on every table; the policies are the real access control, and the UI checks only mirror them.

## Tables (schema `public`)

| Table | Purpose | Who can read | Who can write |
|---|---|---|---|
| `summer_programs` | Program directory (bilingual columns, `lid` primary key, `slug` URL key) | Paid users | Admin |
| `profiles` | One row per user: `is_paid`, `enforce_device_lock`, `active_session_id`, `notes` | The user (own row) | The user (own row, with trigger guards on `is_paid` and `enforce_device_lock`); admin via RPC |
| `favorites` | Saved programs per user | The user | The user |
| `summer_program_prompts` | Essay prompts per program (`program_slug`, ordering columns) | Paid users | Admin |
| `program_example_essays` | Edited example essays for a prompt | Paid users | Admin |
| `essay_originals` | Untouched originals of example essays (admin-only, cascades on delete) | Admin | Admin |
| `interview_guides`, `interview_questions` | Interview preparation content | Paid users | Admin |
| `program_documents` | AI reference essays with a pgvector `embedding` | Nobody directly; searched through `match_documents` | Admin |

`public_summer_programs` is a view of published programs that omits the paid analysis columns, so the Program Directory can be public. It runs with the owner's privileges and is granted to `anon` and `authenticated`.

## Functions

| Function | Purpose |
|---|---|
| `is_admin()` | True when the JWT e-mail is the admin's. Must match `ADMIN_EMAILS` in `lib/admin/config.ts`. |
| `match_documents(query_embedding, match_threshold, match_count)` | Vector search over `program_documents`; `SECURITY DEFINER`, callable only by paid users and the admin |
| `admin_list_users()`, `admin_update_user(...)` | Member management; `SECURITY DEFINER`, each checks `is_admin()` itself |
| `admin_set_is_paid(...)` | Sets `is_paid` past the `profiles` guard trigger. Not executable by `anon` or `authenticated`, so it can only be called with elevated credentials (SQL editor or service role) |
| `admin_reorder_prompts(...)`, `admin_reorder_interviews(...)` | Atomic drag-and-drop reordering; `SECURITY DEFINER`, check `is_admin()` |

Extension: `vector` (pgvector).

## Migrations

`migrations/` holds the changes made after the project was first created, named with the version Supabase recorded when each was applied:

| Version | Name |
|---|---|
| `20261007154259` | `public_summer_programs_view` |
| `20261007223619` | `admin_cms_access` |
| `20261007232911` | `admin_reorder_rpcs` |
| `20261008003409` | `essay_originals` (includes the later `essay_originals_tighten_grants`) |

All four are already applied to the production project. Do not re-run them there.

### Known gap

The migrations are incremental. The original tables (`summer_programs`, `profiles`, `favorites`, the prompt, essay, interview and document tables), their pre-existing policies, the `profiles` guard triggers and `admin_set_is_paid` were created before migrations were tracked and are not in this directory, so a new project cannot be built from these files alone. To close the gap, run `supabase db pull` against the project to capture a baseline migration, and commit it ahead of the files above.

`lib/database.types.ts` is hand-maintained and does not yet include `essay_originals`. Replace it with `supabase gen types typescript` output if you want it generated.

## Security review notes

The Supabase security advisor currently reports the following. None is a known exploitable issue, but they are worth resolving:

- **`public_summer_programs` is a `SECURITY DEFINER` view.** Intentional: it is the public projection that hides paid columns. Switching it to `security_invoker` would require a public read policy on the base table that also excludes those columns.
- **Mutable `search_path` on `guard_is_paid_update` and `guard_enforce_device_lock_update`.** Fix with `alter function public.<name>() set search_path = '';` (both only use `NEW`, `OLD`, `current_user` and `current_setting`).
- **`vector` is installed in `public`.** Moving it to an `extensions` schema is recommended; check that `match_documents` and the embedding column type still resolve afterwards.
- **`SECURITY DEFINER` functions executable by `authenticated`.** Expected for the admin RPCs and `match_documents`, which authorise inside the function body.
- **Leaked-password protection is off.** Enable it under Authentication, Password security in the dashboard.
