import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseServer } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/context/LanguageContext";
import { SessionWatcher } from "@/app/dashboard/_components/SessionWatcher";
import { getViewer } from "@/lib/viewer";
import { isAdminEmail } from "@/lib/admin/config";
import { DEVICE_SESSION_COOKIE } from "@/lib/session";
import type { Lang } from "@/lib/database.types";

interface SiteShellProps {
  children: React.ReactNode;
  /** Let the page span the full width (used by the landing page). */
  fullBleed?: boolean;
}

/**
 * Shared chrome for every page that shows the main navigation bar — the public
 * landing page, the public Program Directory, and the members-only pages.
 *
 * Responsibilities:
 * 1. Work out who is looking (guest / unpaid / paid) and pass that to the Navbar.
 * 2. For paid members only: enforce single-device sign-in. If the ss_sid cookie
 *    no longer matches profiles.active_session_id, another device has taken over
 *    this account, so sign out via the force-signout Route Handler (calling
 *    signOut() here would crash — cookies().set() is forbidden in Server
 *    Components).
 * 3. Read the `lang` cookie to seed the LanguageProvider.
 */
export async function SiteShell({ children, fullBleed = false }: SiteShellProps) {
  const { user, isPaid, access } = await getViewer();

  const cookieStore = await cookies();
  let deviceLockEnabled = false;

  if (user && isPaid) {
    const supabase = await supabaseServer();
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_session_id, enforce_device_lock")
      .eq("id", user.id)
      .single();

    deviceLockEnabled = profile?.enforce_device_lock !== false;
    const cookieSessionId = cookieStore.get(DEVICE_SESSION_COOKIE)?.value;

    if (
      deviceLockEnabled &&
      profile?.active_session_id &&
      cookieSessionId !== profile.active_session_id
    ) {
      redirect("/api/auth/force-signout?reason=duplicate_session");
    }
  }

  const rawLang = cookieStore.get("lang")?.value;
  const initialLang: Lang = rawLang === "en" || rawLang === "zh" ? rawLang : "en";

  return (
    <LanguageProvider initialLang={initialLang}>
      {deviceLockEnabled && <SessionWatcher />}
      <AppLayout
        userEmail={user?.email}
        access={access}
        isAdmin={isAdminEmail(user?.email)}
        fullBleed={fullBleed}
      >
        {children}
      </AppLayout>
    </LanguageProvider>
  );
}
