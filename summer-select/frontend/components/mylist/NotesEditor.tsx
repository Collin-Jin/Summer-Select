"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";
import type { Copy } from "./copy";

const MAX_LENGTH = 5000;
const AUTOSAVE_MS = 900;

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface NotesEditorProps {
  initialValue: string;
  /** Persists the notes. Resolves to false when the save failed. */
  onSave: (notes: string) => Promise<boolean>;
  copy: Copy;
}

/**
 * Notes textarea that saves itself: shortly after typing stops, on blur, and
 * when the card is closed or removed. Edits are never silently dropped; a
 * failed save stays marked as retryable.
 */
export function NotesEditor({ initialValue, onSave, copy }: NotesEditorProps) {
  const [text, setText] = useState(initialValue);
  const [state, setState] = useState<SaveState>("idle");

  const latest = useRef(initialValue);
  const lastSaved = useRef(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const queued = useRef(false);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  const flush = async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (latest.current === lastSaved.current) return;
    if (inFlight.current) {
      queued.current = true;
      return;
    }
    inFlight.current = true;
    setState("saving");
    const value = latest.current;
    const ok = await onSaveRef.current(value);
    inFlight.current = false;
    if (ok) lastSaved.current = value;
    if (queued.current) {
      queued.current = false;
      if (ok) {
        void flush();
        return;
      }
    }
    setState(ok ? (latest.current === lastSaved.current ? "saved" : "dirty") : "error");
  };

  // Save anything still pending when the card goes away (navigation, removal).
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => {
    return () => {
      if (latest.current !== lastSaved.current) {
        void onSaveRef.current(latest.current);
      }
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    latest.current = value;
    setState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flushRef.current(), AUTOSAVE_MS);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5" />
          {copy.notes}
        </span>
        <span
          aria-live="polite"
          className="flex items-center gap-1 text-[11px] font-medium normal-case tracking-normal"
        >
          {state === "saving" && (
            <span className="flex items-center gap-1 text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" /> {copy.saving}
            </span>
          )}
          {state === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3 w-3" /> {copy.saved}
            </span>
          )}
          {state === "dirty" && <span className="text-slate-400">{copy.unsaved}</span>}
          {state === "error" && (
            <button
              type="button"
              onClick={() => void flush()}
              className="font-semibold text-rose-600 underline underline-offset-2"
            >
              {copy.saveError}
            </button>
          )}
        </span>
      </div>
      <textarea
        value={text}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder={copy.notesPlaceholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => void flush()}
        aria-label={copy.notes}
        className="block max-h-72 min-h-[84px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed tracking-normal text-slate-800 placeholder:text-slate-400 focus:border-[var(--color-brand-500)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
      />
      {text.length > MAX_LENGTH - 500 && (
        <p className="mt-1 text-right text-[11px] text-slate-400">
          {text.length.toLocaleString("en-US")} / {MAX_LENGTH.toLocaleString("en-US")}
        </p>
      )}
    </div>
  );
}
