"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Check, LayoutDashboard, Pencil, X } from "lucide-react";
import { clsx } from "clsx";
import { loadEditor, setEditMode, type EditorData } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ResourceForm, Toggle } from "@/components/admin/ResourceForm";
import { Spinner } from "@/components/ui/Spinner";

export interface EditorTarget {
  resource: string;
  /** Record id to edit, or null to create a new record. */
  id: string | null;
  /** Pre-filled values for a new record (e.g. the parent program). */
  presets?: Record<string, string>;
}

interface AdminContextValue {
  isAdmin: boolean;
  /** Admin with Edit mode switched on. */
  editing: boolean;
  openEditor: (target: EditorTarget) => void;
  notify: (text: string, ok?: boolean) => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  editing: false,
  openEditor: () => {},
  notify: () => {},
});

export const useAdmin = () => useContext(AdminContext);

/**
 * Gives every page access to the admin's in-place editing tools. For everyone
 * except the admin this renders nothing extra and costs nothing.
 */
export function AdminProvider({
  isAdmin,
  editing,
  children,
}: {
  isAdmin: boolean;
  editing: boolean;
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<EditorTarget | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean; n: number } | null>(null);
  const dirtyRef = useRef(false);
  const router = useRouter();

  const notify = useCallback((text: string, ok = true) => {
    setToast({ text, ok, n: Date.now() });
  }, []);

  const openEditor = useCallback((t: EditorTarget) => {
    dirtyRef.current = false;
    setTarget(t);
  }, []);

  const closeEditor = useCallback((force = false) => {
    if (!force && dirtyRef.current && !window.confirm("Discard your unsaved changes?")) return;
    dirtyRef.current = false;
    setTarget(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.ok ? 3500 : 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo<AdminContextValue>(
    () => ({ isAdmin, editing: isAdmin && editing, openEditor, notify }),
    [isAdmin, editing, openEditor, notify]
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
      {isAdmin && <EditModeBar editing={editing} />}
      {isAdmin && target && (
        <EditorDrawer
          key={`${target.resource}:${target.id ?? "new"}`}
          target={target}
          onClose={() => closeEditor()}
          onDirtyChange={(d) => {
            dirtyRef.current = d;
          }}
          onDone={(message) => {
            closeEditor(true);
            notify(message);
            router.refresh();
          }}
        />
      )}
      {toast && (
        <div
          role="status"
          className={clsx(
            "fixed bottom-24 left-1/2 z-[70] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl",
            toast.ok ? "bg-emerald-600" : "bg-red-600"
          )}
        >
          {toast.ok ? <Check className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {toast.text}
        </div>
      )}
    </AdminContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function EditModeBar({ editing }: { editing: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useAdmin();
  const [on, setOn] = useState(editing);
  const [pending, startTransition] = useTransition();

  // Keep the switch in sync with the server (e.g. after a refresh).
  const [prevEditing, setPrevEditing] = useState(editing);
  if (prevEditing !== editing) {
    setPrevEditing(editing);
    setOn(editing);
  }

  // The full admin panel has its own tools.
  if (pathname.startsWith("/admin")) return null;

  function toggle(next: boolean) {
    setOn(next);
    startTransition(async () => {
      try {
        const res = await setEditMode(next);
        if (!res.ok) {
          setOn(!next);
          notify(res.error ?? "Could not change edit mode.", false);
          return;
        }
        router.refresh();
      } catch {
        setOn(!next);
        notify("Couldn't reach the server. Try again.", false);
      }
    });
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex max-w-[95vw] -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900/95 py-2 pl-4 pr-2 text-sm text-white shadow-2xl backdrop-blur">
      <Pencil className="h-4 w-4 flex-shrink-0 text-[var(--color-brand-accent)]" />
      <span className="hidden font-semibold sm:inline">Edit mode</span>
      <Toggle checked={on} onChange={toggle} disabled={pending} label={on ? "On" : "Off"} />
      {on && (
        <span className="hidden text-xs text-white/60 md:inline">
          Click <Pencil className="inline h-3 w-3" /> to edit · drag to reorder
        </span>
      )}
      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
      >
        <LayoutDashboard className="h-3.5 w-3.5" /> Admin panel
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function EditorDrawer({
  target,
  onClose,
  onDirtyChange,
  onDone,
}: {
  target: EditorTarget;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onDone: (message: string) => void;
}) {
  const [data, setData] = useState<EditorData | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadEditor(target.resource, target.id, target.presets ?? {})
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ ok: false, error: "Couldn't reach the server. Check your connection." });
      });
    return () => {
      cancelled = true;
    };
  }, [target, attempt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = data?.ok ? data.title : target.id ? "Edit" : "New";

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/40" onMouseDown={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-slate-50 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {data?.ok ? (target.id ? `Editing ${data.spec.singular}` : `Adding ${data.spec.singular}`) : "Loading…"}
            </p>
            <h2 className="truncate text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {!data ? (
            <div className="flex h-48 items-center justify-center text-slate-400">
              <Spinner size="md" />
            </div>
          ) : !data.ok ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p className="font-semibold">Couldn&rsquo;t open the editor</p>
              <p className="mt-1">{data.error}</p>
              <button
                type="button"
                onClick={() => {
                  setData(null);
                  setAttempt((n) => n + 1);
                }}
                className="mt-3 rounded-lg bg-white px-3 py-1.5 font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          ) : (
            <ResourceForm
              spec={data.spec}
              id={data.id}
              initialValues={data.initialValues}
              refOptions={data.refOptions}
              suggestions={data.suggestions}
              onCancel={onClose}
              onDirtyChange={onDirtyChange}
              onSaved={(r) => onDone(r.message)}
              extraActions={
                data.id ? (
                  <DeleteButton
                    resourceKey={data.spec.key}
                    id={data.id}
                    name={`“${data.title}”`}
                    cascade={data.cascade}
                    onDeleted={onDone}
                  />
                ) : undefined
              }
            />
          )}
        </div>
      </aside>
    </div>
  );
}
