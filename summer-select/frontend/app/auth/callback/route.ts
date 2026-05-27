import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  DEVICE_SESSION_COOKIE,
  deviceSessionCookieOptions,
} from "@/lib/session";

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Register this device as the active session so single-device
      // enforcement applies to users arriving via email links too.
      const sessionId = randomUUID();
      await supabase
        .from("profiles")
        .update({ active_session_id: sessionId })
        .eq("id", data.user.id);

      const cookieStore = await cookies();
      cookieStore.set(DEVICE_SESSION_COOKIE, sessionId, deviceSessionCookieOptions());

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // If something went wrong, redirect to login with an error hint.
  return NextResponse.redirect(new URL("/login?reason=link_expired", origin));
}
