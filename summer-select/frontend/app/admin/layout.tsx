import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";
import { countRecentBlockedSignIns } from "@/lib/admin/data";

export const metadata: Metadata = {
  title: "Admin · Summer Select",
  robots: { index: false, follow: false },
};

// Always render fresh: admin pages show live database content.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = await requireAdmin();
  const [{ count: openReports }, recentBlocked] = await Promise.all([
    supabase.from("error_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    countRecentBlockedSignIns(supabase),
  ]);

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 hidden px-3 text-xs font-bold uppercase tracking-widest text-slate-400 lg:block">
            Admin
          </p>
          <AdminNav openReports={openReports ?? 0} recentBlocked={recentBlocked} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </SiteShell>
  );
}
