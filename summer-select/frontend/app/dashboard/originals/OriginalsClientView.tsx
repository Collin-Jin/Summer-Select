"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Loader2, Lock, Search } from "lucide-react";
import { clsx } from "clsx";
import { inputClass } from "@/components/admin/styles";
import { saveEssayOriginal } from "./actions";

export interface OriginalsEssay {
  id: string;
  programSlug: string;
  programName: string;
  prompt: string;
  year: number | null;
  outcome: string | null;
  published: boolean;
  /** The privacy-edited essay that members see. */
  edited: string;
  /** The untouched original (empty until the admin enters it). */
  original: string;
}

function wordCount(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

type Status = { kind: "idle" } | { kind: "saved"; at: number } | { kind: "error"; message: string };

function EssayPair({ essay }: { essay: OriginalsEssay }) {
  // `saved` is what's in the database; `text` is what's in the box.
  const [saved, setSaved] = useState(essay.original);
  const [text, setText] = useState(essay.original);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  const dirty = text !== saved;

  // Warn before leaving the page with unsaved original text.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = () => {
    if (!dirty || pending) return;
    const submitted = text;
    startTransition(async () => {
      const result = await saveEssayOriginal(essay.id, submitted);
      if (result.ok) {
        setSaved(submitted);
        setStatus({ kind: "saved", at: Date.now() });
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    });
  };

  const entered = saved.trim() !== "";

  return (
    <article
      id={`essay-${essay.id}`}
      className="rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: "var(--color-brand-100)" }}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">
            {essay.programName}
            {essay.year ? <span className="font-medium text-slate-500"> · {essay.year}</span> : null}
            {essay.outcome ? <span className="font-medium text-slate-500"> · {essay.outcome}</span> : null}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{essay.prompt}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {!essay.published && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              Draft
            </span>
          )}
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              entered ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            )}
          >
            {entered ? "Original entered" : "Original missing"}
          </span>
        </div>
      </header>

      <div className="grid gap-px bg-slate-100 lg:grid-cols-2">
        {/* Original (editable, private) */}
        <section className="flex min-w-0 flex-col bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-700">
              <Lock className="h-3.5 w-3.5" /> Original (private)
            </h3>
            <span className="text-xs tabular-nums text-slate-400">{wordCount(text)} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (status.kind !== "idle") setStatus({ kind: "idle" });
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                save();
              }
            }}
            placeholder="Paste the untouched original essay here…"
            aria-label={`Original essay for ${essay.programName}`}
            rows={14}
            className={clsx(inputClass, "min-h-[18rem] flex-1 resize-y font-serif leading-relaxed")}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p
              role="status"
              className={clsx(
                "text-xs",
                status.kind === "error" ? "font-medium text-red-600" : "text-slate-500"
              )}
            >
              {status.kind === "error"
                ? status.message
                : status.kind === "saved" && !dirty
                  ? "Saved."
                  : dirty
                    ? "Unsaved changes (⌘/Ctrl+S to save)"
                    : ""}
            </p>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || pending}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--color-brand-500)" }}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status.kind === "saved" && !dirty ? (
                <Check className="h-4 w-4" />
              ) : null}
              {pending ? "Saving…" : "Save original"}
            </button>
          </div>
        </section>

        {/* Edited (read only, what members see) */}
        <section className="flex min-w-0 flex-col bg-slate-50/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand-600)]">
              Edited (shown to members)
            </h3>
            <span className="text-xs tabular-nums text-slate-400">{wordCount(essay.edited)} words</span>
          </div>
          <div className="max-h-[32rem] min-h-[18rem] flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-3 py-2 font-serif text-sm leading-relaxed text-slate-800">
            {essay.edited}
          </div>
        </section>
      </div>
    </article>
  );
}

export function OriginalsClientView({ essays }: { essays: OriginalsEssay[] }) {
  const [program, setProgram] = useState("all");
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  const programs = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of essays) if (!map.has(e.programSlug)) map.set(e.programSlug, e.programName);
    return [...map.entries()].map(([slug, name]) => ({ slug, name }));
  }, [essays]);

  const q = query.trim().toLowerCase();
  const visible = essays.filter(
    (e) =>
      (program === "all" || e.programSlug === program) &&
      (!onlyMissing || e.original.trim() === "") &&
      (!q ||
        e.programName.toLowerCase().includes(q) ||
        e.prompt.toLowerCase().includes(q) ||
        (e.outcome ?? "").toLowerCase().includes(q) ||
        String(e.year ?? "").includes(q))
  );

  const enteredCount = essays.filter((e) => e.original.trim() !== "").length;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
          <Lock className="h-3 w-3" /> Admin only
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Original essays
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          The untouched essay (left) next to the privacy-edited version members see (right). Originals
          are stored in a separate admin-only table and are never shown to anyone else.{" "}
          <span className="font-medium text-slate-700">
            {enteredCount} of {essays.length} entered.
          </span>
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search program, prompt, year or outcome"
            aria-label="Search essays"
            className={clsx(inputClass, "pl-9")}
          />
        </div>
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          aria-label="Filter by program"
          className={clsx(inputClass, "w-auto max-w-xs")}
        >
          <option value="all">All programs ({essays.length})</option>
          {programs.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} ({essays.filter((e) => e.programSlug === p.slug).length})
            </option>
          ))}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onlyMissing}
            onChange={(e) => setOnlyMissing(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Only missing originals
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          {essays.length === 0 ? "There are no example essays yet." : "No essays match these filters."}
        </p>
      ) : (
        <div className="space-y-5">
          {visible.map((e) => (
            <EssayPair key={e.id} essay={e} />
          ))}
        </div>
      )}
    </div>
  );
}
