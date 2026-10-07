import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { clsx } from "clsx";
import { requireAdmin } from "@/lib/admin/auth";
import { listRecords } from "@/lib/admin/data";
import { getResource } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable } from "@/components/admin/ResourceTable";
import { inputClass } from "@/components/admin/styles";

type Status = "all" | "published" | "draft";

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 80);
  const status: Status = first(sp.status) === "published" ? "published" : first(sp.status) === "draft" ? "draft" : "all";
  const pageNum = Number.parseInt(first(sp.page), 10);

  const result = await listRecords(supabase, resource, {
    q,
    status: resource.hasPublished ? status : "all",
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  });

  const href = (overrides: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | number | null> = { q, status: status === "all" ? null : status, page: null, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v !== null && v !== "") p.set(k, String(v));
    const qs = p.toString();
    return `/admin/${resource.key}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title={resource.label}
        description={resource.description}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: resource.label }]}
        actions={
          <Link
            href={`/admin/${resource.key}/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-600)]"
          >
            <Plus className="h-4 w-4" /> New {resource.singular}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form action={`/admin/${resource.key}`} method="get" className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder={`Search ${resource.label.toLowerCase()}`}
            className={clsx(inputClass, "pl-9")}
            autoComplete="off"
          />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
        </form>

        {resource.hasPublished && (
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
            {(["all", "published", "draft"] as const).map((s) => (
              <Link
                key={s}
                href={href({ status: s === "all" ? null : s })}
                className={clsx(
                  "border-l border-slate-200 px-3.5 py-2 font-medium capitalize transition first:border-l-0",
                  status === s ? "bg-[var(--color-brand-500)] text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {s}
              </Link>
            ))}
          </div>
        )}

        <p className="ml-auto text-sm text-slate-500">
          {result.total} {result.total === 1 ? resource.singular : resource.label.toLowerCase()}
        </p>
      </div>

      <ResourceTable
        resource={resource}
        rows={result.rows}
        emptyText={q || status !== "all" ? "Nothing matches your search." : undefined}
      />

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-sm">
          {result.page > 1 ? (
            <Link href={href({ page: result.page - 1 })} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate-500">
            Page {result.page} of {result.pageCount}
          </span>
          {result.page < result.pageCount ? (
            <Link href={href({ page: result.page + 1 })} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
