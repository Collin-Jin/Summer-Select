import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

/**
 * Auth callback route — exchanges Supabase's PKCE `code` for a session,
 * then redirects to the `next` query param (e.g. /reset-password).
 *
 * Supabase email links land here with:
 *   GET /auth/callback?code=<code>&next=/reset-password
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // If something went wrong, redirect to login with an error hint.
  return NextResponse.redirect(new URL("/login?reason=link_expired", origin));
}
