# Supabase schema

The app expects a Supabase project with the objects below. Row-Level Security is enabled on every table; the policies are the real access control, and the UI checks only mirror them.

## Tables (schema `public`)

| Table | Purpose | Who can read | Who can write |
|---|---|---|---|
| `summer_programs` | Program directory (bilingual columns, `lid` primary key, `slug` URL key) | Paid users; signed-in users through `member_summer_programs`, everyone through `public_summer_programs` | Admin |
| `profiles` | One row per user: `is_paid`, `enforce_device_lock`, `active_session_id`, `notes` | The user (own row) | The user (own row, with trigger guards on `is_paid` and `enforce_device_lock`); admin via RPC |
| `favorites` | Saved programs per user, with the user's `rating` (1–5), private `notes` (max 5,000 characters) and application `status` | The user | The user |
| `summer_program_prompts` | Essay prompts per program (`program_slug`, ordering columns) | Paid users | Admin |
| `program_example_essays` | Edited example essays for a prompt | Paid users | Admin |
| `essay_originals` | Untouched originals of example essays (admin-only, cascades on delete) | Admin | Admin |
| `interview_guides`, `interview_questions` | Interview preparation content | Paid users | Admin |
| `program_documents` | AI reference essays with a pgvector `embedding` | Nobody directly; searched through `match_documents` | Admin |

Program data is exposed in three tiers:

| Reader | Relation | Analysis text (`collin_rationale_*`, `collin_strategy_*`) |
|---|---|---|
| Guest (`anon`) | `public_summer_programs` | Hidden |
| Signed-in user, paid or not | `member_summer_programs` | Included |
| Paid user, admin | `summer_programs` (base table) | Included |

Both views list published programs only and run with the owner's privileges so they can read the base table. They are **SELECT-only** for API roles: a simple view is auto-updatable, so any write privilege would bypass the base table's RLS. `member_summer_programs` is granted to `authenticated` only and also requires `auth.uid() is not null`.

## Functions

| Function | Purpose |
|---|---|
| `is_admin()` | True when the JWT e-mail is the admin's. Must match `ADMIN_EMAILS` in `lib/admin/config.ts`. |
| `match_documents(query_embedding, match_threshold, match_count)` | Vector search over `program_documents`; `SECURITY DEFINER`, callable only by paid users and the admin |
| `admin_list_users()`, `admin_update_user(...)` | Member management (the list includes the first and last name from the account metadata); `SECURITY DEFINER`, each checks `is_admin()` itself |
| `admin_delete_user(p_user_id)` | Deletes a member's account (profile, favorites and blocked sign-in history go with it; problem reports they filed are kept). `SECURITY DEFINER`, checks `is_admin()`, refuses the admin's own account |
| `admin_set_is_paid(...)` | Sets `is_paid` past the `profiles` guard trigger. Not executable by `anon` or `authenticated`, so it can only be called with elevated credentials (SQL editor or service role) |
| `programs_with_essays()` | Counts of published example essays and prompts per program (no essay text). `SECURITY DEFINER`, callable by everyone, so a program page can link to its essays even though the essays are paid-only |
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
| `20261009211213` | `member_summer_programs_view` |
| `20261009211234` | `public_summer_programs_read_only_grants` (revokes write privileges the view had inherited from default privileges) |
| `20261009214149` | `favorites_planner` (rating, notes, status and `updated_at` on `favorites`, with a touch trigger and tighter grants) |
| `20261010043303` | `remove_program_category` (drops `primary_category_en/zh` from `summer_programs` and recreates both program views without them) |
| `20261010045438` | `error_reports_and_essay_counts` (the `error_reports` table: anyone can insert, only the admin can read, update or delete, plus an insert throttle trigger; and `programs_with_essays()`) |
| `20261010190538` | `member_names_and_blocked_sign_ins` (`admin_list_users()` returns first and last name; the `blocked_sign_ins` table records sign-ins turned away by the one-device rule, insertable only by the blocked account itself, readable and clearable only by the admin, with a per-account throttle) |
| `20261010191704` | `admin_delete_user` (the function behind "Delete member" on the Members page) |
| `20261010224703` | `program_requests` (the `program_requests` table: anyone can insert, only the admin can read, update or delete, plus a per-visitor daily throttle trigger) |

All twelve are already applied to the production project. Do not re-run them there.

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
