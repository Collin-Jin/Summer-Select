import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DEVICE_SESSION_COOKIE } from "@/lib/session";

/**
 * Lightweight session-validation endpoint polled by SessionWatcher.
 * Returns { valid: true } when the ss_sid cookie matches the DB, or
 * { valid: false, reason } when the device has been superseded.
 * Fails open (returns valid: true) on any unexpected error so a network
 * hiccup never falsely logs out a user.
 */
export async function GET() {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ valid: false, reason: "unauthenticated" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("active_session_id, enforce_device_lock")
      .eq("id", user.id)
      .single();

    if (profile?.enforce_device_lock === false) {
      return NextResponse.json({ valid: true });
    }

    const cookieStore = await cookies();
    const cookieSessionId = cookieStore.get(DEVICE_SESSION_COOKIE)?.value;

    if (
      profile?.active_session_id &&
      cookieSessionId !== profile.active_session_id
    ) {
      return NextResponse.json({ valid: false, reason: "duplicate_session" });
    }

    return NextResponse.json({ valid: true });
  } catch {
    // Fail open — a transient error should never log out a legitimate user.
    return NextResponse.json({ valid: true });
  }
}
