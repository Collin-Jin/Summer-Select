"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";
import { clsx } from "clsx";
import { updateUserAccess } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Toggle } from "./ResourceForm";
import { inputClass } from "./styles";

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  has_profile: boolean;
  is_paid: boolean;
  enforce_device_lock: boolean;
  has_active_session: boolean;
  notes: string | null;
}

type Filter = "all" | "paid" | "unpaid";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function UsersManager({ users }: { users: AdminUser[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: users.length,
      paid: users.filter((u) => u.is_paid).length,
      unpaid: users.filter((u) => !u.is_paid).length,
    }),
    [users]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "paid" && !u.is_paid) return false;
      if (filter === "unpaid" && u.is_paid) return false;
      if (q && !(u.email ?? "").toLowerCase().includes(q) && !(u.notes ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
          {(["all", "paid", "unpaid"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                "border-l border-slate-200 px-3.5 py-2 font-medium capitalize transition first:border-l-0",
                filter === f ? "bg-[var(--color-brand-500)] text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or note"
            className={clsx(inputClass, "pl-9")}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No members match.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                open={openId === u.id}
                onToggle={() => setOpenId(openId === u.id ? null : u.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, open, onToggle }: { user: AdminUser; open: boolean; onToggle: () => void }) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState(user.is_paid);
  const [deviceLock, setDeviceLock] = useState(user.enforce_device_lock);
  const [notes, setNotes] = useState(user.notes ?? "");
  const [resetSession, setResetSession] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    isPaid !== user.is_paid ||
    deviceLock !== user.enforce_device_lock ||
    notes.trim() !== (user.notes ?? "").trim() ||
    resetSession;

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await updateUserAccess({
          userId: user.id,
          isPaid,
          enforceDeviceLock: deviceLock,
          notes,
          resetSession,
        });
        if (!res.ok) {
          setMessage({ ok: false, text: res.error ?? "Could not save." });
          return;
        }
        setResetSession(false);
        setMessage({ ok: true, text: res.message });
        router.refresh();
      } catch {
        setMessage({ ok: false, text: "Couldn't reach the server. Try again." });
      }
    });
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{user.email ?? "(no email)"}</p>
          <p className="text-xs text-slate-500">
            Joined {fmtDate(user.created_at)} · Last sign-in {fmtDate(user.last_sign_in_at)}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
          {!user.email_confirmed && <Pill tone="amber">Unconfirmed</Pill>}
          {user.has_active_session && <Pill tone="slate">Signed in on a device</Pill>}
          <Pill tone={user.is_paid ? "green" : "slate"}>{user.is_paid ? "Paid" : "Not paid"}</Pill>
        </div>
        <ChevronDown className={clsx("h-4 w-4 flex-shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/60 px-5 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-800">Paid member</p>
              <Toggle checked={isPaid} onChange={setIsPaid} label={isPaid ? "Has full access" : "No access to member features"} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-800">One-device sign-in</p>
              <Toggle checked={deviceLock} onChange={setDeviceLock} label={deviceLock ? "Enforced" : "Off (can use several devices)"} />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={resetSession}
              onChange={(e) => setResetSession(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>
              <span className="font-medium">Sign out their current device.</span>{" "}
              <span className="text-slate-500">Frees the account so they can log in somewhere new.</span>
            </span>
          </label>

          <div>
            <label htmlFor={`notes-${user.id}`} className="mb-1.5 block text-sm font-semibold text-slate-800">
              Private notes
            </label>
            <textarea
              id={`notes-${user.id}`}
              rows={3}
              value={notes}
              maxLength={2000}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment method, referral, anything you want to remember. Only you can see this."
              className={clsx(inputClass, "resize-y")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save} loading={pending} disabled={!dirty}>
              Save member
            </Button>
            {message && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 text-sm font-medium",
                  message.ok ? "text-emerald-600" : "text-red-600"
                )}
                role="status"
              >
                {message.ok && <Check className="h-4 w-4" />}
                {message.text}
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function Pill({ tone, children }: { tone: "green" | "slate" | "amber"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "slate" && "bg-slate-100 text-slate-600",
        tone === "amber" && "bg-amber-100 text-amber-700"
      )}
    >
      {children}
    </span>
  );
}
