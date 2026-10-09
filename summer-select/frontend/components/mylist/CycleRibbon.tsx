"use client";

import { clsx } from "clsx";
import { cycleMonths, toMonthKey, type CycleWindow, type PlannerEvent, isDeadline } from "@/lib/planner";
import type { Lang } from "@/lib/database.types";
import { formatDay, type Copy } from "./copy";

interface CycleRibbonProps {
  window: CycleWindow;
  today: Date;
  /** Deadline events (opening dates excluded) still shown on the timeline. */
  events: PlannerEvent[];
  copy: Copy;
  lang: Lang;
}

/** Thirteen months as bars: taller means more deadlines. Click a month to jump to it. */
export function CycleRibbon({ window, today, events, copy, lang }: CycleRibbonProps) {
  const months = cycleMonths(window);
  const counts = new Map<string, number>();
  for (const e of events) {
    if (!isDeadline(e)) continue;
    const key = e.date.slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const max = Math.max(1, ...counts.values());
  const todayKey = toMonthKey(today);

  return (
    <section
      aria-label={copy.ribbonTitle}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-sm font-semibold text-slate-700">
        {copy.ribbonTitle}
        <span className="ml-2 font-normal text-slate-400">{window.label}</span>
      </h2>
      <ol className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
        {months.map((m, i) => {
          const count = counts.get(m.key) ?? 0;
          const isNow = m.key === todayKey;
          const isPast = m.key < todayKey;
          const date = new Date(m.year, m.month, 1);
          const height = count === 0 ? 4 : 14 + Math.round((count / max) * 42);
          const inner = (
            <>
              <div className="flex h-[60px] w-full items-end justify-center">
                <div
                  className={clsx(
                    "w-full max-w-[28px] origin-bottom rounded-t-lg animate-fade-in-up transition-[filter] duration-200",
                    count > 0 && !isPast && "group-hover:brightness-110"
                  )}
                  style={{
                    height,
                    background: count === 0 ? "#E2E8F0" : isPast ? "#B8B8D1" : "var(--color-brand-500)",
                    animationDelay: `${i * 35}ms`,
                  }}
                />
              </div>
              <span
                className={clsx(
                  "mt-1.5 text-[10px] font-semibold uppercase sm:text-[11px]",
                  isNow ? "text-[var(--color-brand-600)]" : "text-slate-400"
                )}
              >
                {formatDay(date, lang, { month: "short" })}
              </span>
              <span className="h-4 text-[11px] font-bold tabular-nums text-slate-700">
                {count > 0 ? count : ""}
              </span>
            </>
          );
          const base = clsx(
            "group flex flex-col items-center rounded-xl px-0.5 pb-0.5 pt-2",
            isNow && "bg-[var(--color-brand-50)] ring-1 ring-[var(--color-brand-200)]"
          );
          return (
            <li key={m.key} className="min-w-0">
              {count > 0 ? (
                <a
                  href={`#month-${m.key}`}
                  aria-label={`${formatDay(date, lang, { month: "long", year: "numeric" })}: ${count}`}
                  className={clsx(
                    base,
                    "transition-colors hover:bg-[var(--color-brand-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
                  )}
                >
                  {inner}
                </a>
              ) : (
                <div className={base} title={copy.ribbonEmpty}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
