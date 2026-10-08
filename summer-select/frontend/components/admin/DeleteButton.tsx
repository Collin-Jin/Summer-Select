"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteRecord } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

interface DeleteButtonProps {
  resourceKey: string;
  id: string;
  /** What the record is called, e.g. "the program “MIT RSI”". */
  name: string;
  /** Things that will be deleted with it. */
  cascade?: { label: string; count: number }[];
  /** In-page editor: called after a successful delete instead of navigating. */
  onDeleted?: (message: string) => void;
}

export function DeleteButton({ resourceKey, id, name, cascade = [], onDeleted }: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteRecord(resourceKey, id);
        if (!res.ok) {
          setError(res.error ?? "Could not delete.");
          return;
        }
        if (onDeleted) {
          onDeleted(res.message);
          return;
        }
        router.push(res.redirectTo ?? `/admin/${resourceKey}`);
        router.refresh();
      } catch {
        setError("Couldn't reach the server. Try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-red-100 p-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 id="delete-title" className="text-lg font-bold text-slate-900">
                  Delete {name}?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  This removes it from the website immediately and can&rsquo;t be undone.
                </p>
                {cascade.length > 0 && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    This will also permanently delete{" "}
                    {cascade.map((c, i) => (
                      <span key={c.label}>
                        {i > 0 && (i === cascade.length - 1 ? " and " : ", ")}
                        <strong>
                          {c.count} {c.label}
                        </strong>
                      </span>
                    ))}
                    .
                  </p>
                )}
                {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" autoFocus onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirm} loading={pending}>
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
