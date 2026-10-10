"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search, ShieldAlert, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { clearBlockedSignIns, deleteUser, updateUserAccess } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "./ResourceForm";
import { describeDevice, describeLocation } from "@/lib/device";
import { fullName } from "@/lib/names";
import { inputClass } from "./styles";

export interface AdminUser {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  has_profile: boolean;
  is_paid: boolean;
  enforce_device_lock: boolean;
  has_active_session: boolean;
  notes: string | null;
}

/** A sign-in that was turned away because the account is registered to another device. */
export interface BlockedSignIn {
  id: string;
  user_id: string;
  created_at: string;
  user_agent: string | null;
  country: string | null;
  city: string | null;
}

type Filter = "all" | "paid" | "unpaid" | "blocked";

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function UsersManager({
  users,
  blocked,
  currentUserId,
}: {
  users: AdminUser[];
  blocked: BlockedSignIn[];
  /** The signed-in admin; their own account cannot be deleted from here. */
  currentUserId: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Blocked attempts per member, newest first (the page loads them newest first).
  const attemptsByUser = useMemo(() => {
    const map = new Map<string, BlockedSignIn[]>();
    for (const b of blocked) {
      const list = map.get(b.user_id);
      if (list) list.push(b);
      else map.set(b.user_id, [b]);
    }
    return map;
  }, [blocked]);

  const counts = useMemo(
    () => ({
      all: users.length,
      paid: users.filter((u) => u.is_paid).length,
      unpaid: users.filter((u) => !u.is_paid).length,
      blocked: users.filter((u) => attemptsByUser.has(u.id)).length,
    }),
    [users, attemptsByUser]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "paid" && !u.is_paid) return false;
      if (filter === "unpaid" && u.is_paid) return false;
      if (filter === "blocked" && !attemptsByUser.has(u.id)) return false;
      if (
        q &&
        !(u.email ?? "").toLowerCase().includes(q) &&
        !(fullName(u.first_name, u.last_name) ?? "").toLowerCase().includes(q) &&
        !(u.notes ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [users, filter, query, attemptsByUser]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm shadow-sm">
          {(["all", "paid", "unpaid", "blocked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                "border-l border-slate-200 px-3.5 py-2 font-medium capitalize transition first:border-l-0",
                filter === f ? "bg-[var(--color-brand-500)] text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {f === "blocked" ? "Blocked sign-ins" : f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or note"
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
                attempts={attemptsByUser.get(u.id) ?? []}
                canDelete={u.id !== currentUserId}
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

function UserRow({
  user,
  attempts,
  canDelete,
  open,
  onToggle,
}: {
  user: AdminUser;
  attempts: BlockedSignIn[];
  canDelete: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState(user.is_paid);
  const [deviceLock, setDeviceLock] = useState(user.enforce_device_lock);
  const [notes, setNotes] = useState(user.notes ?? "");
  const [resetSession, setResetSession] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const name = fullName(user.first_name, user.last_name);

  function remove() {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await deleteUser(user.id);
        if (!res.ok) {
          setMessage({ ok: false, text: res.error ?? "Could not delete." });
          return;
        }
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
          <p className="truncate text-sm font-semibold text-slate-900">{name ?? user.email ?? "(no email)"}</p>
          {name && <p className="truncate text-xs text-slate-600">{user.email ?? "(no email)"}</p>}
          <p className="text-xs text-slate-500">
            Joined {fmtDate(user.created_at)} · Last sign-in {fmtDate(user.last_sign_in_at)}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
          {attempts.length > 0 && (
            <Pill tone="red">
              {attempts.length} blocked sign-in{attempts.length === 1 ? "" : "s"}
            </Pill>
          )}
          {!user.email_confirmed && <Pill tone="amber">Unconfirmed</Pill>}
          {user.has_active_session && user.is_paid && <Pill tone="slate">Signed in on a device</Pill>}
          <Pill tone={user.is_paid ? "green" : "slate"}>{user.is_paid ? "Paid" : "Not paid"}</Pill>
        </div>
        <ChevronDown className={clsx("h-4 w-4 flex-shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/60 px-5 py-5">
          {attempts.length > 0 && <BlockedAttempts userId={user.id} attempts={attempts} />}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-800">Paid member</p>
              <Toggle checked={isPaid} onChange={setIsPaid} label={isPaid ? "Has full access" : "No access to member features"} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-800">One-device sign-in</p>
              <Toggle
                checked={deviceLock}
                onChange={setDeviceLock}
                label={deviceLock ? "Enforced" : "Off (can use several devices)"}
              />
              {!isPaid && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Only applies to paid members. Free accounts can sign in on any device.
                </p>
              )}
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
            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Delete member
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this member?"
        description={
          <>
            <strong className="text-slate-800">{name ? `${name} (${user.email})` : (user.email ?? "This account")}</strong>{" "}
            will be removed permanently, along with their saved programs, notes and sign-in history. They will no
            longer be able to sign in, and this can&apos;t be undone.
            {user.is_paid && <> This member is marked as paid.</>}
          </>
        }
        confirmLabel="Delete member"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          remove();
        }}
      />
    </li>
  );
}

function Pill({ tone, children }: { tone: "green" | "slate" | "amber" | "red"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "slate" && "bg-slate-100 text-slate-600",
        tone === "amber" && "bg-amber-100 text-amber-700",
        tone === "red" && "bg-red-100 text-red-700"
      )}
    >
      {children}
    </span>
  );
}

const VISIBLE_ATTEMPTS = 10;

/** The times this member was turned away from a device that isn't their registered one. */
function BlockedAttempts({ userId, attempts }: { userId: string; attempts: BlockedSignIn[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function clear() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await clearBlockedSignIns(userId);
        if (!res.ok) {
          setError(res.error ?? "Could not clear.");
          return;
        }
        router.refresh();
      } catch {
        setError("Couldn't reach the server. Try again.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-800">
          <ShieldAlert className="h-4 w-4" aria-hidden />
          Blocked sign-ins ({attempts.length})
        </p>
        <button
          type="button"
          onClick={clear}
          disabled={pending}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-60"
        >
          {pending ? "Clearing…" : "Clear history"}
        </button>
      </div>
      <p className="mt-1 text-xs text-red-700/80">
        Each time this member entered the right password on a different browser and was told their account is
        registered to another device.
      </p>
      <ul className="mt-3 divide-y divide-red-100 text-sm text-slate-700">
        {attempts.slice(0, VISIBLE_ATTEMPTS).map((a) => (
          <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5">
            <span className="font-medium text-slate-800">{describeDevice(a.user_agent)}</span>
            <span className="text-xs text-slate-500">
              {describeLocation(a.city, a.country) && <>{describeLocation(a.city, a.country)} · </>}
              <time dateTime={a.created_at} suppressHydrationWarning>
                {fmtDateTime(a.created_at)}
              </time>
            </span>
          </li>
        ))}
      </ul>
      {attempts.length > VISIBLE_ATTEMPTS && (
        <p className="mt-2 text-xs text-slate-500">Showing the latest {VISIBLE_ATTEMPTS} of {attempts.length}.</p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
