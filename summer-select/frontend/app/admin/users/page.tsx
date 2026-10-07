import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { UsersManager, type AdminUser } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("admin_list_users");

  if (error) {
    throw new Error(`Could not load members: ${error.message}`);
  }

  const users = ((data ?? []) as AdminUser[]).slice().sort((a, b) => {
    // Newest sign-ups first.
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });

  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone with an account. Turn on “Paid” to give a member access to My List, Essays, Evaluate and Interviews."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Members" }]}
      />
      <UsersManager users={users} />
    </>
  );
}
