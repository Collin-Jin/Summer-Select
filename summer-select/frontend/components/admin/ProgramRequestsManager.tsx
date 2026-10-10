"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Plus, RotateCcw, Trash2, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { deleteProgramRequest, setProgramRequestStatus } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PROGRAM_REQUEST_TURNAROUND_DAYS, type ProgramRequestStatus } from "@/lib/programRequests";
import type { ProgramRequest } from "@/lib/database.types";

/** A request as the admin sees it (the rate-limit fingerprint is never loaded). */
export type AdminProgramRequest = Omit<ProgramRequest, "client_id">;

type Filter = ProgramRequestStatus | "all";

const FILTER_LABEL: Record<Filter, string> = {
  pending: "Pending",
  added: "Added",
  declined: "Declined",
  all: "All",
};

const STATUS_STYLE: Record<ProgramRequestStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-800" },
  added: { label: "Added", className: "bg-green-50 text-green-700" },
  declined: { label: "Declined", className: "bg-slate-100 text-slate-600" },
};

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** The day visitors were promised the program would be in the directory. */
function fmtDueDate(createdIso: string): string {
  const d = new Date(createdIso);
  if (Number.isNaN(d.getTime())) return "—";
  d.setDate(d.getDate() + PROGRAM_REQUEST_TURNAROUND_DAYS);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ProgramRequestsManager({ requests }: { requests: AdminProgramRequest[] }) {
  const [filter, setFilter] = useState<Filter>("pending");

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      added: requests.filter((r) => r.status === "added").length,
      declined: requests.filter((r) => r.status === "declined").length,
      all: requests.length,
    }),
    [requests]
  );

  const visible = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
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
          {filter === "pending" ? "No pending requests. You're all caught up." : "No requests here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: AdminProgramRequest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = request.status;
  const isPending = status === "pending";
  const style = STATUS_STYLE[status];

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
        isPending ? "border-l-[3px] border-slate-200 [border-left-color:var(--color-brand-coral)]" : "border-slate-200"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className={clsx("rounded-full px-2 py-0.5 font-semibold", style.className)}>{style.label}</span>
        <time dateTime={request.created_at} suppressHydrationWarning>
          {fmtDateTime(request.created_at)}
        </time>
        <span>{request.user_id ? "Member" : "Guest"}</span>
        {request.requester_email && (
          <a
            href={`mailto:${request.requester_email}`}
            className="font-medium text-[var(--color-brand-600)] hover:underline"
          >
            {request.requester_email}
          </a>
        )}
        {isPending && (
          <span className="ml-auto font-medium text-slate-600" suppressHydrationWarning>
            Promised by {fmtDueDate(request.created_at)}
          </span>
        )}
      </div>

      <h3 className={clsx("mt-3 break-words text-base font-bold", isPending ? "text-slate-900" : "text-slate-600")}>
        {request.program_name}
      </h3>

      {request.program_url && (
        <a
          href={request.program_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-sm text-[var(--color-brand-600)] hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
          <span className="truncate">{request.program_url}</span>
        </a>
      )}

      {request.notes && (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{request.notes}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        {isPending ? (
          <>
            <Link
              href="/admin/programs/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-600)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden /> Create program
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setProgramRequestStatus(request.id, "added"))}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark added
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setProgramRequestStatus(request.id, "declined"))}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" aria-hidden /> Decline
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setProgramRequestStatus(request.id, "pending"))}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Back to pending
            </button>
            {request.handled_at && (
              <span className="text-xs text-slate-500">
                {style.label} {fmtDateTime(request.handled_at)}
              </span>
            )}
          </>
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
        title="Delete this request?"
        description="It will be removed permanently. If you've handled it, use “Mark added” or “Decline” instead so you keep a record."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          run(() => deleteProgramRequest(request.id));
        }}
      />
    </li>
  );
}
