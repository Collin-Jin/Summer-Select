/**
 * Pure (server/client safe) helpers describing what a visitor may access.
 * Keep server-only imports out of this file — client components use it.
 */

/**
 * How much of the product the current visitor can use:
 *  - "guest":  not signed in. Browses the Program Directory and Collin Index.
 *  - "unpaid": registered (free account). Also gets Collin's application
 *              analysis and My List.
 *  - "paid":   registered and paid. Also gets example essays, the essay
 *              evaluator and interview guides.
 */
export type ViewerAccess = "guest" | "unpaid" | "paid";

/** Free accounts and paid members: anyone who has signed in. */
export function isRegistered(access: ViewerAccess): boolean {
  return access !== "guest";
}

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
 * Routes that need a signed-in user (a free account is enough). Members-only
 * pages that need payment (Essays, Evaluate, Interviews) are NOT listed: they
 * render a blurred preview with a sign-up / upgrade prompt instead of
 * redirecting. Their data is protected by Supabase RLS and, for the evaluator,
 * by a check in the API route. The admin check lives in `app/admin/layout.tsx`
 * and in the database. Everything else, such as the landing page, the Program
 * Directory and the auth pages, is public.
 */
const LOGIN_REQUIRED_PREFIXES = [
  "/dashboard/my-list",
  "/dashboard/originals",
  "/admin",
] as const;

/** True when a guest must be sent to the login page for this pathname. */
export function requiresLogin(pathname: string): boolean {
  return LOGIN_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Login URL that opens the Create Account tab and returns to `next` afterwards. */
export function signupUrl(next?: string | null): string {
  const params = new URLSearchParams({ tab: "signup" });
  if (isSafeNextPath(next)) params.set("next", next);
  return `/login?${params.toString()}`;
}

/** Login URL that opens the Sign In tab and returns to `next` afterwards. */
export function signinUrl(next?: string | null): string {
  const params = new URLSearchParams();
  if (isSafeNextPath(next)) params.set("next", next);
  const qs = params.toString();
  return qs ? `/login?${qs}` : "/login";
}
