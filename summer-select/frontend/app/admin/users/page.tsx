import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { UsersManager, type AdminUser, type BlockedSignIn } from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const [{ data, error }, blockedRes] = await Promise.all([
    supabase.rpc("admin_list_users"),
    supabase
      .from("blocked_sign_ins")
      .select("id, user_id, created_at, user_agent, country, city")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  if (error) {
    throw new Error(`Could not load members: ${error.message}`);
  }
  if (blockedRes.error) {
    throw new Error(`Could not load blocked sign-ins: ${blockedRes.error.message}`);
  }

  const users = ((data ?? []) as AdminUser[]).slice().sort((a, b) => {
    // Newest sign-ups first.
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });

  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone with an account, with the name they signed up with. Turn on “Paid” to give a member access to My List, Essays, Evaluate and Interviews. Members who tried to sign in from another device are flagged."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Members" }]}
      />
      <UsersManager users={users} blocked={(blockedRes.data ?? []) as BlockedSignIn[]} />
    </>
  );
}
