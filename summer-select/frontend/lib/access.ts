/**
 * Pure (server/client safe) helpers describing what a visitor may access.
 * Keep server-only imports out of this file — client components use it.
 */

/**
 * How much of the product the current visitor can use:
 *  - "guest":  not signed in
 *  - "unpaid": signed in, but has not paid yet
 *  - "paid":   signed in and paid (full access)
 */
export type ViewerAccess = "guest" | "unpaid" | "paid";

/** Only allow same-site relative paths as post-login redirect targets. */
export function isSafeNextPath(path: string | null | undefined): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\")
  );
}

/** Builds the login URL used when a guest hits a members-only feature. */
export function loginUrl(next?: string | null): string {
  const params = new URLSearchParams({ reason: "login_required" });
  if (isSafeNextPath(next)) params.set("next", next);
  return `/login?${params.toString()}`;
}

/**
 * Routes that need a signed-in user. The payment check for members-only
 * features happens in `app/dashboard/(paid)/layout.tsx`, and the admin check in
 * `app/admin/layout.tsx` and in the database (RLS). Everything else, such as
 * the landing page, the Program Directory and the auth pages, is public.
 */
const LOGIN_REQUIRED_PREFIXES = [
  "/dashboard/my-list",
  "/dashboard/essays",
  "/dashboard/evaluate",
  "/dashboard/interviews",
  "/dashboard/originals",
  "/admin",
] as const;

/** True when a guest must be sent to the login page for this pathname. */
export function requiresLogin(pathname: string): boolean {
  return LOGIN_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
