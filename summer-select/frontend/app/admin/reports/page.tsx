import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReportsManager, type AdminReport } from "@/components/admin/ReportsManager";

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("error_reports")
    .select("id, created_at, message, page_url, reporter_email, user_id, status, resolved_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Could not load problem reports: ${error.message}`);
  }

  return (
    <>
      <PageHeader
        title="Problem reports"
        description="Mistakes and bugs that visitors reported from the “Report a problem” button. Mark one resolved once you've fixed it."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Problem reports" }]}
      />
      <ReportsManager reports={(data ?? []) as AdminReport[]} />
    </>
  );
}
