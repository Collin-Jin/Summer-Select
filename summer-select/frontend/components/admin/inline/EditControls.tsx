"use client";

import { Pencil, Plus } from "lucide-react";
import { clsx } from "clsx";
import { useAdmin } from "./AdminProvider";

/**
 * Small pencil that opens the in-page editor for one record. Renders nothing
 * unless the admin has Edit mode on, so it is safe to put anywhere.
 */
export function EditButton({
  resource,
  id,
  label = "Edit",
  variant = "icon",
  className,
}: {
  resource: string;
  id: string;
  label?: string;
  variant?: "icon" | "pill" | "light";
  className?: string;
}) {
  const { editing, openEditor } = useAdmin();
  if (!editing) return null;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditor({ resource, id });
      }}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition",
        variant === "icon" &&
          "h-8 w-8 rounded-full bg-[var(--color-brand-accent)] text-slate-900 shadow-md ring-2 ring-white hover:brightness-95",
        variant === "light" &&
          "h-7 w-7 rounded-full bg-white/90 text-[var(--color-brand-700)] shadow ring-1 ring-black/5 hover:bg-white",
        variant === "pill" &&
          "rounded-lg bg-[var(--color-brand-accent)] px-3 py-1.5 text-sm text-slate-900 shadow-sm hover:brightness-95",
        className
      )}
    >
      <Pencil className={variant === "pill" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {variant === "pill" && label}
    </button>
  );
}

/** Dashed "add" button that opens an empty editor (optionally pre-filled). */
export function AddButton({
  resource,
  presets,
  label,
  className,
}: {
  resource: string;
  presets?: Record<string, string>;
  label: string;
  className?: string;
}) {
  const { editing, openEditor } = useAdmin();
  if (!editing) return null;

  return (
    <button
      type="button"
      onClick={() => openEditor({ resource, id: null, presets })}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--color-brand-200)] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[var(--color-brand-600)] transition hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)]",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

/** Amber "Draft" tag, shown only to the admin in Edit mode. */
export function DraftBadge({ published, className }: { published: boolean | null | undefined; className?: string }) {
  const { editing } = useAdmin();
  if (!editing || published !== false) return null;
  return (
    <span className={clsx("rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700", className)}>
      Draft · hidden from students
    </span>
  );
}
