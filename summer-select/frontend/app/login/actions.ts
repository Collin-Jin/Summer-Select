"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  DEVICE_SESSION_COOKIE,
  deviceSessionCookieOptions,
} from "@/lib/session";

function getAuthFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
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
        await supabase.auth.signOut({ scope: "local" });
        return { error: "device_locked" as const };
      }

      // First login, or same registered device reconnecting with a matching cookie.
      await writeSessionId(supabase, data.user.id);
    }
  }

  redirect("/dashboard");
}

export async function handleSignUp(formData: FormData) {
  const { email, password } = getAuthFields(formData);
  if (!email || !password) return { error: "Email and password are required." as const };
  if (password.length < 8) return { error: "Password must be at least 8 characters." as const };

  const supabase = await supabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
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

  redirect("/dashboard");
}

export async function handleForgotPassword(email: string) {
  if (!email?.trim()) return { error: "Email is required." };

  const supabase = await supabaseServer();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return error ? { error: error.message } : { success: true };
}

export async function handleResendVerification(email: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  return error ? { error: error.message } : { success: true };
}
