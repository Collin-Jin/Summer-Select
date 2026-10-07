import Link from "next/link";
import { Plus } from "lucide-react";
import type { ChildRows } from "@/lib/admin/data";
import type { ResourceDef, Values } from "@/lib/admin/resources";
import { PublishSwitch } from "./PublishSwitch";

/**
 * The records that belong to the one being edited (e.g. a program's essay
 * prompts). Each links to its own edit page; "Add" pre-selects the parent.
 */
export function ChildrenPanel({
  parent,
  parentRow,
  data,
}: {
  parent: ResourceDef;
  parentRow: Values;
  data: ChildRows;
}) {
  const { child, resource, rows } = data;
  const parentValue = String(parentRow[child.parentColumn ?? parent.pk]);
  const addHref = `/admin/${resource.key}/new?${new URLSearchParams({ [child.field]: parentValue }).toString()}`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900">{child.title}</h2>
          <p className="text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? resource.singular : resource.label.toLowerCase()}
          </p>
        </div>
        <Link
          href={addHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-100)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-brand-600)] transition hover:bg-[var(--color-brand-50)]"
        >
          <Plus className="h-4 w-4" /> Add {resource.singular}
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => {
            const id = String(row[resource.pk]);
            return (
              <li key={id} className="flex items-center gap-4 px-5 py-3">
                <Link
                  href={`/admin/${resource.key}/${id}`}
                  className="min-w-0 flex-1 text-sm font-medium text-slate-800 hover:text-[var(--color-brand-600)] hover:underline"
                >
                  <span className="line-clamp-2">{resource.title(row)}</span>
                </Link>
                {resource.hasPublished && (
                  <PublishSwitch
                    key={`${id}-${row.is_published === true}`}
                    resourceKey={resource.key}
                    id={id}
                    initial={row.is_published === true}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
