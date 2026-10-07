import Link from "next/link";
import { Check, Minus } from "lucide-react";
import type { ListColumn, ResourceDef, Values } from "@/lib/admin/resources";
import { PublishSwitch } from "./PublishSwitch";

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function Cell({ resource, column, row }: { resource: ResourceDef; column: ListColumn; row: Values }) {
  const value = row[column.key];

  if (column.key === "is_published" && resource.hasPublished) {
    const id = String(row[resource.pk]);
    return <PublishSwitch key={`${id}-${value === true}`} resourceKey={resource.key} id={id} initial={value === true} />;
  }

  switch (column.kind) {
    case "bool":
      return value === true ? (
        <Check className="h-4 w-4 text-emerald-600" aria-label="Yes" />
      ) : (
        <Minus className="h-4 w-4 text-slate-300" aria-label="No" />
      );
    case "date":
      return <span className="whitespace-nowrap text-slate-600">{formatDate(value)}</span>;
    case "number":
      return <span className="tabular-nums text-slate-600">{value === null || value === undefined || value === "" ? "—" : String(value)}</span>;
    case "badge":
      return value ? (
        <span className="inline-block max-w-[16rem] truncate rounded-full bg-[var(--color-brand-50)] px-2.5 py-0.5 align-middle text-xs font-medium text-[var(--color-brand-700)]">
          {String(value)}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      );
    case "clamp":
      return <span className="line-clamp-2 max-w-md text-slate-600">{value ? String(value) : "—"}</span>;
    default:
      return <span className="text-slate-700">{value === null || value === undefined || value === "" ? "—" : String(value)}</span>;
  }
}

/** A list of records. The first column links to the record's edit page. */
export function ResourceTable({
  resource,
  rows,
  emptyText,
}: {
  resource: ResourceDef;
  rows: Values[];
  emptyText?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        {emptyText ?? `No ${resource.label.toLowerCase()} yet.`}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {resource.columns.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 font-semibold">
                {c.label}
              </th>
            ))}
            <th scope="col" className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const id = String(row[resource.pk]);
            const href = `/admin/${resource.key}/${id}`;
            return (
              <tr key={id} className="transition hover:bg-slate-50/70">
                {resource.columns.map((c, i) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {i === 0 ? (
                      <Link href={href} className="font-semibold text-[var(--color-brand-600)] hover:underline">
                        <span className="line-clamp-2">
                          {row[c.key] !== null && row[c.key] !== undefined && row[c.key] !== ""
                            ? String(row[c.key])
                            : resource.title(row)}
                        </span>
                      </Link>
                    ) : (
                      <Cell resource={resource} column={c} row={row} />
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-right align-middle">
                  <Link
                    href={href}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
