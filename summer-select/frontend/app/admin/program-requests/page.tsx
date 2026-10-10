import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProgramRequestsManager, type AdminProgramRequest } from "@/components/admin/ProgramRequestsManager";
import { PROGRAM_REQUEST_TURNAROUND_DAYS } from "@/lib/programRequests";

export default async function AdminProgramRequestsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("program_requests")
    .select("id, created_at, program_name, program_url, notes, requester_email, user_id, status, handled_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Could not load program requests: ${error.message}`);
  }

  return (
    <>
      <PageHeader
        title="Program requests"
        description={`Programs visitors asked to have added to the directory. They were told you'd research each one and add it within ${PROGRAM_REQUEST_TURNAROUND_DAYS} days.`}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Program requests" }]}
      />
      <ProgramRequestsManager requests={(data ?? []) as AdminProgramRequest[]} />
    </>
  );
}
