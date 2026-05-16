import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/context/LanguageContext";
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
 * 3. Read the `lang` cookie to seed the LanguageProvider with the correct initial language.
 * 4. Wrap the child page in AppLayout (Navbar + content area).
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
    .select("is_paid")
    .eq("id", user.id)
    .single();

  if (!profile?.is_paid) {
    redirect("/paywall");
  }

  const cookieStore = await cookies();
  const rawLang = cookieStore.get("lang")?.value;
  const initialLang: Lang =
    rawLang === "en" || rawLang === "zh" ? rawLang : "en";

  return (
    <LanguageProvider initialLang={initialLang}>
      <AppLayout userEmail={user.email}>{children}</AppLayout>
    </LanguageProvider>
  );
}
