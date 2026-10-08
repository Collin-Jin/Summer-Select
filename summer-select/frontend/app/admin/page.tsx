import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getResourceCounts } from "@/lib/admin/data";
import { NAV_RESOURCE_KEYS, RESOURCES } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const [counts, usersRes] = await Promise.all([
    getResourceCounts(supabase),
    supabase.rpc("admin_list_users"),
  ]);

  const users = (usersRes.data ?? []) as { is_paid: boolean }[];
  const paidCount = users.filter((u) => u.is_paid).length;

  return (
    <>
      <PageHeader
        title="Admin"
        description="Edit everything on the website from here. Changes are saved to your database and go live immediately."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {NAV_RESOURCE_KEYS.map((key) => {
          const r = RESOURCES[key];
          const c = counts[key];
          const drafts = c.published === null ? 0 : c.total - c.published;
          return (
            <section key={key} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500">{r.label}</h2>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">{c.total}</p>
              <p className="mt-0.5 min-h-[1.25rem] text-xs text-slate-500">
                {c.published !== null &&
                  (drafts > 0 ? `${c.published} live · ${drafts} draft${drafts === 1 ? "" : "s"}` : "All live")}
              </p>
              <p className="mt-3 flex-1 text-sm text-slate-600">{r.description}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/${key}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-600)] hover:underline"
                >
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/${key}/new`}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" /> New
                </Link>
              </div>
            </section>
          );
        })}

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Members</h2>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">{users.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">{paidCount} paid</p>
          <p className="mt-3 flex-1 text-sm text-slate-600">
            Mark who has paid, reset a locked device, and keep private notes.
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-600)] hover:underline"
          >
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-5 text-sm text-[var(--color-brand-700)]">
        <h2 className="font-bold">Tips</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Open any program on the public site while signed in and use the <strong>Edit</strong> button to jump straight to its form.</li>
          <li>Switch a record to <strong>Draft</strong> to hide it without deleting it.</li>
          <li>Use <strong>Arrange essays / interviews</strong> in the sidebar to drag programs, prompts and questions into the order students see.</li>
          <li>Essay prompts, example essays and interview questions are edited from inside their program or guide.</li>
        </ul>
      </section>
    </>
  );
}
