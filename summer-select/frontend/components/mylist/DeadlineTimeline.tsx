"use client";

import Link from "next/link";
import { CalendarOff, Check, Star } from "lucide-react";
import { clsx } from "clsx";
import {
  STATUS_META,
  URGENCY_COLORS,
  isDeadline,
  isStatusDone,
  toDateKey,
  toMonthKey,
  urgencyOf,
  parseDate,
  type CycleWindow,
} from "@/lib/planner";
import type { Lang } from "@/lib/database.types";
import { formatDay, programName, relativeDays, type Copy } from "./copy";
import type { DeadlineItem, SavedEntry } from "./types";

interface DeadlineTimelineProps {
  /** Events inside the cycle, sorted by date. */
  items: DeadlineItem[];
  /** Events dated before or after the cycle. */
  outside: DeadlineItem[];
  /** Programs with no usable date. */
  undated: SavedEntry[];
  window: CycleWindow;
  today: Date;
  showOpens: boolean;
  onShowOpensChange: (value: boolean) => void;
  copy: Copy;
  lang: Lang;
}

type Row =
  | { type: "month"; key: string; date: Date }
  | { type: "today" }
  | { type: "event"; item: DeadlineItem };

function buildRows(items: DeadlineItem[], today: Date): Row[] {
  const todayKey = toDateKey(today);
  const rows: Row[] = [];
  let currentMonth = "";
  let todayPlaced = false;

  const placeToday = () => {
    const key = toMonthKey(today);
    if (key !== currentMonth) {
      rows.push({ type: "month", key, date: new Date(today.getFullYear(), today.getMonth(), 1) });
      currentMonth = key;
    }
    rows.push({ type: "today" });
    todayPlaced = true;
  };

  for (const item of items) {
    if (!todayPlaced && item.event.date >= todayKey) placeToday();
    const monthKey = item.event.date.slice(0, 7);
    if (monthKey !== currentMonth) {
      const d = parseDate(item.event.date) as Date;
      rows.push({ type: "month", key: monthKey, date: new Date(d.getFullYear(), d.getMonth(), 1) });
      currentMonth = monthKey;
    }
    rows.push({ type: "event", item });
  }
  if (!todayPlaced) placeToday();
  return rows;
}

/** Vertical timeline of every deadline in the admission cycle, with a "today" marker. */
export function DeadlineTimeline({
  items,
  outside,
  undated,
  window,
  today,
  showOpens,
  onShowOpensChange,
  copy,
  lang,
}: DeadlineTimelineProps) {
  const visible = showOpens ? items : items.filter((i) => isDeadline(i.event));
  const rows = buildRows(visible, today);
  let eventIndex = 0;

  return (
    <section aria-label={copy.timelineTitle} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          {copy.timelineTitle}
          <span className="ml-2 text-sm font-medium text-slate-400">{window.label}</span>
        </h2>
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showOpens}
            onChange={(e) => onShowOpensChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-[var(--color-brand-500)]"
          />
          {copy.showOpens}
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{copy.nextNoneHint}</p>
      ) : (
      <ol className="relative ml-1 border-l-2 border-slate-100 pl-7">
        {rows.map((row) => {
          if (row.type === "month") {
            return (
              <li
                key={`m-${row.key}`}
                id={`month-${row.key}`}
                className="scroll-mt-24 pb-2 pt-6 first:pt-0"
              >
                <span className="inline-block rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-600)]">
                  {formatDay(row.date, lang, { month: "long", year: "numeric" })}
                </span>
              </li>
            );
          }

          if (row.type === "today") {
            return (
              <li key="today" className="relative py-2" aria-label={copy.today}>
                <span
                  aria-hidden
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--color-brand-coral)] ring-4 ring-[#FF6B6C]/20"
                  style={{ left: "calc(-1.75rem - 7px)" }}
                />
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[var(--color-brand-coral)] px-3 py-1 text-xs font-bold text-white">
                    {copy.today} · {formatDay(today, lang, { month: "short", day: "numeric" })}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-[var(--color-brand-coral)]/40" />
                </div>
              </li>
            );
          }

          const { item } = row;
          const { event, entry, days } = item;
          const date = parseDate(event.date) as Date;
          const done = isStatusDone(entry.status);
          const deadline = isDeadline(event);
          const urgency = urgencyOf(days);
          const colors = URGENCY_COLORS[urgency];
          const delay = Math.min(eventIndex++, 12) * 40;

          let chip: React.ReactNode;
          if (!deadline) {
            chip = (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                {relativeDays(days, copy)}
              </span>
            );
          } else if (done) {
            const meta = STATUS_META[entry.status];
            chip = (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ color: meta.color, background: meta.bg }}
              >
                <Check className="h-3 w-3" />
                {lang === "zh" ? meta.zh : meta.en}
              </span>
            );
          } else {
            const missed = urgency === "passed";
            chip = (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ color: missed ? "#92600A" : colors.fg, background: missed ? "#FFF3CC" : colors.bg }}
              >
                {urgency === "passed" ? copy.missed : relativeDays(days, copy)}
              </span>
            );
          }

          return (
            <li key={event.id} className="relative py-1.5 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
              <span
                aria-hidden
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white",
                  deadline ? "h-3 w-3" : "ml-0.5 h-2 w-2"
                )}
                style={{
                  left: "calc(-1.75rem - 7px)",
                  background: done && deadline ? "#10B981" : deadline ? colors.dot : "#CBD5E1",
                  boxShadow: deadline && !done && (urgency === "urgent" || urgency === "today") ? "0 0 0 4px rgba(255,107,108,0.2)" : undefined,
                }}
              />
              <a
                href={`#program-${entry.program.lid}`}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-150 hover:-translate-y-px hover:border-[var(--color-brand-200)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] sm:gap-4 sm:px-4",
                  deadline ? "border-slate-200 bg-white" : "border-dashed border-slate-200 bg-slate-50/50",
                  (urgency === "passed" || done) && "opacity-70"
                )}
              >
                <div className="w-11 flex-shrink-0 text-center leading-none">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {formatDay(date, lang, { month: "short" })}
                  </p>
                  <p className="text-xl font-extrabold tabular-nums text-slate-800">{date.getDate()}</p>
                  <p className="text-[10px] text-slate-400">{formatDay(date, lang, { weekday: "short" })}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{programName(entry.program, lang)}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span className={clsx(deadline && "font-semibold", event.kind === "priority" && "text-[#92600A]")}>
                      {copy.kind[event.kind]}
                    </span>
                    {entry.rating !== null && (
                      <span className="inline-flex items-center gap-0.5 text-slate-500">
                        <Star className="h-3 w-3 text-[#FFC145]" fill="#FFC145" />
                        {entry.rating}
                      </span>
                    )}
                  </p>
                </div>
                {chip}
              </a>
            </li>
          );
        })}
      </ol>
      )}

      {(undated.length > 0 || outside.length > 0) && (
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          {undated.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <CalendarOff className="h-4 w-4 text-slate-400" />
                {copy.noDeadlines}
              </h3>
              <ul className="space-y-1.5">
                {undated.map((e) => (
                  <li key={e.program.lid}>
                    <Link
                      href={`#program-${e.program.lid}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm transition-colors hover:border-[var(--color-brand-200)]"
                    >
                      <span className="truncate font-medium text-slate-700">{programName(e.program, lang)}</span>
                      <span className="flex-shrink-0 rounded-full bg-[#FF6B6C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#B42318]">
                        {e.program.is_rolling_admission ? copy.rolling : copy.tbd}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-400">{copy.noDeadlinesHint}</p>
            </div>
          )}
          {outside.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">{copy.outsideCycle}</h3>
              <ul className="space-y-1.5">
                {outside.filter((i) => isDeadline(i.event)).map((i) => (
                  <li key={i.event.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <span className="truncate font-medium text-slate-700">{programName(i.entry.program, lang)}</span>
                    <span className="flex-shrink-0 text-xs text-slate-500">
                      {formatDay(parseDate(i.event.date) as Date, lang, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
