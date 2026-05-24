import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

/**
 * Route Handler that performs a local sign-out and redirects to login.
 *
 * This must be a Route Handler (not a Server Component) because
 * supabase.auth.signOut() internally calls cookies().set() to clear the
 * auth token — which Next.js 15+ only permits in Route Handlers and
 * Server Actions, not in regular Server Components.
 *
 * Used by:
 *  - dashboard/layout.tsx  (redirects here on session mismatch)
 *  - SessionWatcher.tsx    (navigates here via window.location.href)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reason = searchParams.get("reason") ?? "";

  const supabase = await supabaseServer();
  await supabase.auth.signOut({ scope: "local" });

  const dest = reason ? `/login?reason=${reason}` : "/login";
  return NextResponse.redirect(new URL(dest, origin));
}
