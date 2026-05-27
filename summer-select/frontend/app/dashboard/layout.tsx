import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/context/LanguageContext";
import { SessionWatcher } from "./_components/SessionWatcher";
import { DEVICE_SESSION_COOKIE } from "@/lib/session";
import type { Lang } from "@/lib/database.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Server Component layout for all /dashboard/* routes.
 *
 * Responsibilities:
 * 1. Verify the user is authenticated via Supabase getUser() (never trusts client).
 * 2. Check the profiles.is_paid flag — unpaid users are redirected to /paywall.
 * 3. Single-device enforcement: compare the ss_sid cookie against
 *    profiles.active_session_id. If they differ, this session has been superseded
 *    by a newer login on another device — sign out and redirect to login.
 * 4. Read the `lang` cookie to seed the LanguageProvider.
 * 5. Wrap the child page in AppLayout (Navbar + content area).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_paid, active_session_id, enforce_device_lock")
    .eq("id", user.id)
    .single();

  if (!profile?.is_paid) {
    redirect("/paywall");
  }

  const deviceLockEnabled = profile.enforce_device_lock !== false;

  // Single-device enforcement: skip when admin disabled it for this user.
  const cookieStore = await cookies();
  const cookieSessionId = cookieStore.get(DEVICE_SESSION_COOKIE)?.value;

  if (
    deviceLockEnabled &&
    profile.active_session_id &&
    cookieSessionId !== profile.active_session_id
  ) {
    // Another device has logged in and taken over this account.
    // Redirect to the force-signout Route Handler which calls signOut legally.
    // Calling signOut() directly here would crash because cookies().set() is
    // forbidden in Server Components in Next.js 15+.
    redirect("/api/auth/force-signout?reason=duplicate_session");
  }

  const rawLang = cookieStore.get("lang")?.value;
  const initialLang: Lang =
    rawLang === "en" || rawLang === "zh" ? rawLang : "en";

  return (
    <LanguageProvider initialLang={initialLang}>
      {deviceLockEnabled && <SessionWatcher />}
      <AppLayout userEmail={user.email}>{children}</AppLayout>
    </LanguageProvider>
  );
}
