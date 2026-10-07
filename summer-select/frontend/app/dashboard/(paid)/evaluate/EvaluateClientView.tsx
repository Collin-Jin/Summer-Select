"use client";

import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

// ── Minimal, dependency-free Markdown rendering for AI feedback ──────────────

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

type Block =
  | { type: "heading"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function parseFeedback(markdown: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const last = blocks[blocks.length - 1];

    if (heading) {
      blocks.push({ type: "heading", text: heading[1] });
    } else if (bullet) {
      if (last?.type === "ul") last.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else if (numbered) {
      if (last?.type === "ol") last.items.push(numbered[1]);
      else blocks.push({ type: "ol", items: [numbered[1]] });
    } else if (last?.type === "ul" || last?.type === "ol") {
      // Wrapped continuation line of the previous list item.
      last.items[last.items.length - 1] += " " + line;
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

function Feedback({ markdown }: { markdown: string }) {
  const blocks = parseFeedback(markdown);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3
                key={i}
                className="pt-4 first:pt-0 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--color-brand-accent)" }}
                    />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "var(--color-brand-500)" }}
                    >
                      {j + 1}
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return <p key={i}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function EvaluateClientView() {
  const [essay, setEssay] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || !essay.trim()) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to evaluate essay.");
      }
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
      <header className="space-y-2">
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-syne, sans-serif)", color: "var(--color-brand-700)" }}
        >
          Essay Evaluator
        </h1>
        <p className="text-slate-600">
          Paste your draft below. Our AI reviewer compares it with real, successful
          essays and gives you specific, actionable feedback.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="essay" className="sr-only">
          Your draft essay
        </label>
        <textarea
          id="essay"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          disabled={loading}
          placeholder="Paste your draft essay here..."
          className="w-full min-h-[22rem] resize-y rounded-2xl border border-slate-200 bg-white p-5 text-[15px] leading-relaxed text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100/60 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <button
            type="submit"
            disabled={loading || !essay.trim()}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-110"
            style={{ background: "var(--color-brand-500)" }}
          >
            {loading ? (
              <>
                <Spinner size="sm" label="Evaluating" />
                Evaluating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Evaluate Essay
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {feedback && (
        <section
          aria-live="polite"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div
            className="flex items-center gap-2 px-6 py-4 text-white"
            style={{ background: "var(--color-brand-500)" }}
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              Your Feedback
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <Feedback markdown={feedback} />
          </div>
        </section>
      )}
    </div>
  );
}
