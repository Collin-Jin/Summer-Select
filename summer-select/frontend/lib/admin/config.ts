/**
 * Who may use the /admin content editor.
 *
 * IMPORTANT: keep this in sync with the `public.is_admin()` SQL function in
 * Supabase (supabase/migrations/20261007_admin_cms_access.sql). The database is
 * the real gatekeeper — row-level security refuses admin writes from anyone
 * else — and this list only decides what the UI shows.
 */
export const ADMIN_EMAILS: readonly string[] = ["collinjin2029@u.northwestern.edu"];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
