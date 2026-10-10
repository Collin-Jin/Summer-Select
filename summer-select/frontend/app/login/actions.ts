"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import {
  DEVICE_SESSION_COOKIE,
  deviceSessionCookieOptions,
} from "@/lib/session";
import { isSafeNextPath } from "@/lib/access";
import { validateNames } from "@/lib/names";

function getAppOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

function getEmailConfirmRedirect() {
  return `${getAppOrigin()}/auth/callback?next=/auth/confirmed`;
}

function getPasswordResetRedirect() {
  return `${getAppOrigin()}/auth/callback?next=/reset-password`;
}

function getAuthFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  return { email, password, confirmPassword };
}

/**
 * Where to send someone after they authenticate: the page they originally
 * wanted (if it's a safe same-site path), otherwise the Program Directory.
 * Free accounts get real features there too (Collin's analysis and My List).
 */
function postAuthDestination(formData: FormData) {
  const next = formData.get("next");
  const requested = typeof next === "string" ? next : null;
  if (isSafeNextPath(requested)) return requested;
  return "/dashboard";
}

/**
 * After a successful sign-in, generate a session ID, store it in `profiles`,
 * and set it as a cookie. This enables single-device enforcement: when a
 * second device logs in the session ID changes, kicking out the first device.
 */
async function writeSessionId(supabase: Awaited<ReturnType<typeof supabaseServer>>, userId: string) {
  const sessionId = randomUUID();

  // Store in profiles (UPDATE — profile row already exists via trigger)
  await supabase
    .from("profiles")
    .update({ active_session_id: sessionId })
    .eq("id", userId);

  // Set as HttpOnly cookie so the dashboard layout can verify it
  const cookieStore = await cookies();
  cookieStore.set(DEVICE_SESSION_COOKIE, sessionId, deviceSessionCookieOptions());
}

/**
 * Records that this account was turned away from an unregistered device, so the
 * admin can see it on the Members page. Must run while the user's session still
 * exists (the database only lets an account add rows about itself). Never
 * throws: failing to log must not change what the member sees.
 */
async function recordBlockedSignIn(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string
) {
  try {
    const h = await headers();
    // Vercel supplies a coarse location; the IP address itself is not stored.
    const decode = (value: string | null) => {
      if (!value) return null;
      try {
        return decodeURIComponent(value).slice(0, 100);
      } catch {
        return value.slice(0, 100);
      }
    };
    await supabase.from("blocked_sign_ins").insert({
      user_id: userId,
      user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
      country: decode(h.get("x-vercel-ip-country"))?.slice(0, 10) ?? null,
      city: decode(h.get("x-vercel-ip-city")),
    });
  } catch (err) {
    console.error("recordBlockedSignIn failed:", err);
  }
}

export async function handleSignIn(formData: FormData) {
  const { email, password } = getAuthFields(formData);
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await supabaseServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const cookieStore = await cookies();
    const cookieSessionId = cookieStore.get(DEVICE_SESSION_COOKIE)?.value;

    const { data: profile } = await supabase
      .from("profiles")
      .select("active_session_id, enforce_device_lock")
      .eq("id", data.user.id)
      .single();

    const deviceLockEnabled = profile?.enforce_device_lock !== false;

    if (deviceLockEnabled) {
      const registeredId = profile?.active_session_id;

      if (registeredId && cookieSessionId !== registeredId) {
        // Registered device cookie missing or from another browser — block login.
        await recordBlockedSignIn(supabase, data.user.id);
        await supabase.auth.signOut({ scope: "local" });
        return { error: "device_locked" as const };
      }

      // First login, or same registered device reconnecting with a matching cookie.
      await writeSessionId(supabase, data.user.id);
    }
  }

  redirect(postAuthDestination(formData));
}

export async function handleSignUp(formData: FormData) {
  const { email, password, confirmPassword } = getAuthFields(formData);
  const names = validateNames(formData.get("firstName"), formData.get("lastName"));
  if (!names.ok) return { error: names.error };
  if (!email || !password) return { error: "Email and password are required." as const };
  if (password.length < 8) return { error: "Password must be at least 8 characters." as const };
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." as const };
  }

  const supabase = await supabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailConfirmRedirect(),
      // Kept on the account itself so it survives until the e-mail is confirmed.
      data: { first_name: names.firstName, last_name: names.lastName },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      (msg.includes("already") && msg.includes("registered")) ||
      msg.includes("duplicate")
    ) {
      return { error: "email_already_registered" as const, email };
    }
    return { error: error.message as string };
  }

  // Supabase silently "succeeds" for existing confirmed accounts and returns
  // an empty identities array rather than an error when email confirmations are on.
  if (!data.session && data.user?.identities?.length === 0) {
    return { error: "email_already_registered" as const, email };
  }

  // Email confirmation is required — session is null until the user clicks the link.
  if (!data.session) {
    return { success: "verify_email" as const, email };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("enforce_device_lock")
      .eq("id", data.user.id)
      .single();

    if (profile?.enforce_device_lock !== false) {
      await writeSessionId(supabase, data.user.id);
    }
  }

  redirect(postAuthDestination(formData));
}

export async function handleForgotPassword(email: string) {
  if (!email?.trim()) return { error: "Email is required." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirect(),
  });

  return error ? { error: error.message } : { success: true };
}

export async function handleResendPasswordReset(email: string) {
  if (!email?.trim()) return { error: "Email is required." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirect(),
  });

  return error ? { error: error.message } : { success: true };
}

export async function handleResendVerification(email: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: getEmailConfirmRedirect() },
  });
  return error ? { error: error.message } : { success: true };
}
