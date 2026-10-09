"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bookmark, CalendarPlus } from "lucide-react";
import { clsx } from "clsx";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/context/LanguageContext";
import { updateFavorite, type FavoritePatch } from "@/lib/favorites";
import {
  STATUS_META,
  STATUS_ORDER,
  buildEvents,
  buildIcs,
  cycleWindow,
  groupEventsByMonth,
  isDeadline,
  isStatusDone,
  sortEntries,
  totalApplicationFees,
  upcomingDeadlines,
  eventDays,
  type SortMode,
} from "@/lib/planner";
import type { FavoriteStatus } from "@/lib/database.types";
import { COPY, programName } from "@/components/mylist/copy";
import { CycleRibbon } from "@/components/mylist/CycleRibbon";
import { DeadlineTimeline } from "@/components/mylist/DeadlineTimeline";
import { NextDeadlineCard } from "@/components/mylist/NextDeadlineCard";
import { PlannerCard } from "@/components/mylist/PlannerCard";
import { StatTiles } from "@/components/mylist/StatTiles";
import type { DeadlineItem, SavedEntry } from "@/components/mylist/types";
import { useToday } from "@/components/mylist/useToday";

interface MyListClientViewProps {
  entries: SavedEntry[];
  /** Server's calendar date ("YYYY-MM-DD"), used until the browser's date is known. */
  todayKey: string;
}

/**
 * My List planner: closest deadline, a cycle timeline, and a card per saved
 * program with rating, status and private notes.
 *
 * Rating and status save optimistically and roll back on failure. Un-saving a
 * program is confirmed by the heart button (it deletes the notes too); here the
 * card is only hidden, so a failed removal can bring it back intact.
 */
export function MyListClientView({ entries: initialEntries, todayKey }: MyListClientViewProps) {
  const { lang } = useLanguage();
  const copy = COPY[lang];
  const today = useToday(todayKey);

  const [entries, setEntries] = useState(initialEntries);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<SortMode>("deadline");
  const [statusFilter, setStatusFilter] = useState<FavoriteStatus | "all">("all");
  const [showOpens, setShowOpens] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const patchEntry = (programId: string, patch: FavoritePatch) =>
    setEntries((prev) =>
      prev.map((e) =>
        e.program.lid === programId
          ? {
              ...e,
              ...(patch.rating !== undefined && { rating: patch.rating }),
              ...(patch.status !== undefined && { status: patch.status }),
              ...(patch.notes !== undefined && { notes: patch.notes ?? "" }),
            }
          : e
      )
    );

  const handleSave = async (programId: string, patch: FavoritePatch): Promise<boolean> => {
    const current = entries.find((e) => e.program.lid === programId);
    if (!current) return false;

    // Rating and status feel instant; notes are shown by their own editor.
    const optimistic = patch.notes === undefined;
    const previous: FavoritePatch = {
      ...(patch.rating !== undefined && { rating: current.rating }),
      ...(patch.status !== undefined && { status: current.status }),
    };
    if (optimistic) patchEntry(programId, patch);

    const ok = await updateFavorite(programId, patch);
    if (ok) {
      if (!optimistic) patchEntry(programId, patch);
    } else if (optimistic) {
      patchEntry(programId, previous);
      showToast(copy.saveFailedToast);
    }
    return ok;
  };

  const handleToggle = (programId: string, nowFavorited: boolean) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (nowFavorited) next.delete(programId);
      else next.add(programId);
      return next;
    });

  // ── Derived planner data ───────────────────────────────────────────────────
  const live = entries.filter((e) => !hidden.has(e.program.lid));
  const byId = new Map(live.map((e) => [e.program.lid, e]));
  const events = buildEvents(live.map((e) => e.program));
  const toItem = (event: (typeof events)[number]): DeadlineItem => ({
    event,
    entry: byId.get(event.programId) as SavedEntry,
    days: eventDays(event, today),
  });

  const cycle = cycleWindow(today);
  const { months, outside } = groupEventsByMonth(events, cycle);
  const inCycle = months.flatMap((m) => m.events).map(toItem);

  const finished = new Set(live.filter((e) => isStatusDone(e.status)).map((e) => e.program.lid));
  const upcoming = upcomingDeadlines(events, today, finished).map(toItem);
  const hasDeadlines = events.some(isDeadline);

  const withDates = new Set(events.map((e) => e.programId));
  const undated = live.filter((e) => !withDates.has(e.program.lid));

  const nextByProgram = new Map<string, string>();
  for (const item of upcoming) {
    if (!nextByProgram.has(item.event.programId)) nextByProgram.set(item.event.programId, item.event.date);
  }

  const counts = new Map<FavoriteStatus, number>();
  for (const e of live) counts.set(e.status, (counts.get(e.status) ?? 0) + 1);

  const visibleEntries = sortEntries(
    live
      .filter((e) => statusFilter === "all" || e.status === statusFilter)
      .map((e) => ({
        entry: e,
        programId: e.program.lid,
        name: programName(e.program, lang),
        rating: e.rating,
        createdAt: e.createdAt,
        nextDeadline: nextByProgram.get(e.program.lid) ?? null,
      })),
    sort
  );

  const feePrograms = live.filter((e) => !finished.has(e.program.lid)).map((e) => e.program);

  const handleExport = () => {
    const exportable = upcoming.map((i) => i.event);
    const ics = buildIcs(exportable, (id) => programName((byId.get(id) as SavedEntry).program, lang));
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `summer-select-deadlines-${cycle.label}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (live.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{copy.title}</h1>
        <EmptyState
          icon={<Bookmark className="h-10 w-10" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ background: "var(--color-brand-600)" }}
            >
              {copy.browse}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-500)]">
            {copy.cycle} {cycle.label}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.savedCount(live.length)}</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={upcoming.length === 0}
          title={copy.exportHint}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-[var(--color-brand-200)] hover:bg-[var(--color-brand-50)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarPlus className="h-4 w-4" />
          {copy.exportCal}
        </button>
      </div>

      {/* Closest deadline + stats */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NextDeadlineCard
            next={upcoming[0] ?? null}
            then={upcoming.slice(1, 4)}
            allDone={hasDeadlines && upcoming.length === 0}
            copy={copy}
            lang={lang}
          />
        </div>
        <div className="lg:col-span-2">
          <StatTiles
            saved={live.length}
            submitted={finished.size}
            dueSoon={upcoming.filter((i) => i.days <= 30).length}
            fees={totalApplicationFees(feePrograms)}
            copy={copy}
          />
        </div>
      </div>

      <CycleRibbon window={cycle} today={today} events={events} copy={copy} lang={lang} />

      <DeadlineTimeline
        items={inCycle}
        outside={outside.map(toItem)}
        undated={undated}
        window={cycle}
        today={today}
        showOpens={showOpens}
        onShowOpensChange={setShowOpens}
        copy={copy}
        lang={lang}
      />

      {/* Programs */}
      <section aria-label={copy.programsTitle} className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{copy.programsTitle}</h2>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            {copy.sort}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
            >
              {(Object.keys(copy.sortOptions) as SortMode[]).map((m) => (
                <option key={m} value={m}>
                  {copy.sortOptions[m]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={copy.status}>
          {(["all", ...STATUS_ORDER.filter((s) => counts.has(s))] as const).map((s) => {
            const active = statusFilter === s;
            const label = s === "all" ? copy.allStatuses : lang === "zh" ? STATUS_META[s].zh : STATUS_META[s].en;
            const n = s === "all" ? live.length : (counts.get(s) ?? 0);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]",
                  active
                    ? "bg-[var(--color-brand-600)] text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {label} <span className={active ? "text-white/70" : "text-slate-400"}>{n}</span>
              </button>
            );
          })}
        </div>

        {visibleEntries.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{copy.noMatches}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleEntries.map(({ entry }) => (
              <PlannerCard
                key={entry.program.lid}
                entry={entry}
                today={today}
                copy={copy}
                lang={lang}
                onSave={handleSave}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      {toast && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-fade-in-up"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-[var(--color-brand-coral)]" />
          {toast}
        </div>
      )}
    </div>
  );
}
