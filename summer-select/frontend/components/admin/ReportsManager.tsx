"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { deleteReport, setReportStatus } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ErrorReport } from "@/lib/database.types";

/** A report as the admin sees it (the rate-limit fingerprint is never loaded). */
export type AdminReport = Omit<ErrorReport, "client_id">;

type Filter = "open" | "resolved" | "all";

const FILTER_LABEL: Record<Filter, string> = { open: "Open", resolved: "Resolved", all: "All" };

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function ReportsManager({ reports }: { reports: AdminReport[] }) {
  const [filter, setFilter] = useState<Filter>("open");

  const counts = useMemo(
    () => ({
      open: reports.filter((r) => r.status === "open").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      all: reports.length,
    }),
    [reports]
  );

  const visible = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter]
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
        {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={clsx(
              "border-l border-slate-200 px-3.5 py-2 font-medium transition first:border-l-0",
              filter === f ? "bg-[var(--color-brand-500)] text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {FILTER_LABEL[f]} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
          {filter === "open" ? "No open reports. Nothing to fix right now." : "No reports here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: AdminReport }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const resolved = report.status === "resolved";

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await action();
        if (!res.ok) {
          setError(res.error ?? "Something went wrong.");
          return;
        }
        router.refresh();
      } catch {
        setError("Couldn't reach the server. Try again.");
      }
    });
  }

  return (
    <li
      className={clsx(
        "rounded-xl border bg-white p-5 shadow-sm",
        resolved ? "border-slate-200" : "border-l-[3px] border-slate-200 [border-left-color:var(--color-brand-coral)]"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 font-semibold",
            resolved ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}
        >
          {resolved ? "Resolved" : "Open"}
        </span>
        <time dateTime={report.created_at} suppressHydrationWarning>
          {fmtDateTime(report.created_at)}
        </time>
        <span>{report.user_id ? "Member" : "Guest"}</span>
        {report.reporter_email && (
          <a href={`mailto:${report.reporter_email}`} className="font-medium text-[var(--color-brand-600)] hover:underline">
            {report.reporter_email}
          </a>
        )}
      </div>

      <p className={clsx("mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed", resolved ? "text-slate-500" : "text-slate-900")}>
        {report.message}
      </p>

      {report.page_url && (
        <a
          href={report.page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--color-brand-600)]"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
          <span className="truncate font-mono">{report.page_url}</span>
        </a>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        {resolved ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setReportStatus(report.id, "open"))}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reopen
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setReportStatus(report.id, "resolved"))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-600)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark resolved
          </button>
        )}
        {resolved && report.resolved_at && (
          <span className="text-xs text-slate-500">Resolved {fmtDateTime(report.resolved_at)}</span>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" aria-hidden /> Delete
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this report?"
        description="It will be removed permanently. If the problem is fixed, use “Mark resolved” instead so you keep a record."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          run(() => deleteReport(report.id));
        }}
      />
    </li>
  );
}
