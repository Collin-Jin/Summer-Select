import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/context/LanguageContext";
import { SessionWatcher } from "@/app/dashboard/_components/SessionWatcher";
import { getViewer } from "@/lib/viewer";
import { getEditing } from "@/lib/admin/editMode";
import { AdminProvider } from "@/components/admin/inline/AdminProvider";
import { DEVICE_SESSION_COOKIE } from "@/lib/session";
import type { Lang } from "@/lib/database.types";

interface SiteShellProps {
  children: React.ReactNode;
  /** Let the page span the full width (used by the landing page). */
  fullBleed?: boolean;
}

/**
 * Shared chrome for every page that shows the main navigation bar: the public
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
  const { user, isPaid, access, isAdmin } = await getViewer();
  const editing = await getEditing();

  const cookieStore = await cookies();
  let deviceLockEnabled = false;

  // The owner is never kicked out by the one-device rule.
  if (user && isPaid && !isAdmin) {
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
        isAdmin={isAdmin}
        fullBleed={fullBleed}
      >
        <AdminProvider isAdmin={isAdmin} editing={editing}>
          {children}
        </AdminProvider>
      </AppLayout>
    </LanguageProvider>
  );
}
