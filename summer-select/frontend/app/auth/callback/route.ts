import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  DEVICE_SESSION_COOKIE,
  deviceSessionCookieOptions,
} from "@/lib/session";
import { isSafeNextPath } from "@/lib/access";

const CONFIRMED_PATH = "/auth/confirmed";

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
  const requestedNext = searchParams.get("next");
  // Only same-site paths: anything else would make this an open redirect.
  const next = isSafeNextPath(requestedNext) ? requestedNext : "/dashboard";

  if (code) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("enforce_device_lock, is_paid")
        .eq("id", data.user.id)
        .single();

      // The one-device rule is for paid members only.
      if (profile?.is_paid === true && profile.enforce_device_lock !== false) {
        // Register this device as the active session so single-device
        // enforcement applies to users arriving via email links too.
        const sessionId = randomUUID();
        await supabase
          .from("profiles")
          .update({ active_session_id: sessionId })
          .eq("id", data.user.id);

        const cookieStore = await cookies();
        cookieStore.set(DEVICE_SESSION_COOKIE, sessionId, deviceSessionCookieOptions());
      }

      return NextResponse.redirect(new URL(next, origin));
    }

    // Supabase checks the e-mail link itself before sending the visitor here
    // with a code, so for a sign-up confirmation the address is already
    // confirmed even if we can't turn the code into a session. That happens
    // when the link is opened in a different browser or app than the one used
    // to sign up (the secret that pairs the two lives in that browser), or when
    // a newer verification e-mail has since replaced the one they clicked. They
    // still deserve the confirmation page; they just sign in themselves.
    console.error("auth callback: code exchange failed:", error?.message);
    if (next === CONFIRMED_PATH) {
      return NextResponse.redirect(new URL(CONFIRMED_PATH, origin));
    }
  }

  // If something went wrong, redirect to login with an error hint.
  return NextResponse.redirect(new URL("/login?reason=link_expired", origin));
}
