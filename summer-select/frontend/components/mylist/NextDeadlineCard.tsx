"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarCheck, CalendarClock } from "lucide-react";
import { parseDate, urgencyOf } from "@/lib/planner";
import type { Lang } from "@/lib/database.types";
import { formatDay, programName, relativeDays, type Copy } from "./copy";
import type { DeadlineItem } from "./types";

interface NextDeadlineCardProps {
  next: DeadlineItem | null;
  /** The deadlines after `next`, soonest first. */
  then: DeadlineItem[];
  /** True when programs have deadlines but all are finished or past. */
  allDone: boolean;
  copy: Copy;
  lang: Lang;
}

/** The headline card: how long until the closest deadline that still needs action. */
export function NextDeadlineCard({ next, then, allDone, copy, lang }: NextDeadlineCardProps) {
  if (!next) {
    return (
      <section
        className="relative flex min-h-[220px] flex-col justify-center overflow-hidden rounded-3xl p-7 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))" }}
      >
        <CalendarCheck className="mb-3 h-8 w-8 text-[var(--color-brand-accent)]" />
        <h2 className="text-xl font-bold">{copy.nextNone}</h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">
          {allDone ? copy.allSet : copy.nextNoneHint}
        </p>
      </section>
    );
  }

  const { event, entry, days } = next;
  const urgency = urgencyOf(days);
  const hot = urgency === "today" || urgency === "urgent";
  const date = parseDate(event.date) as Date;
  const name = programName(entry.program, lang);

  return (
    <section
      aria-label={copy.nextDeadline}
      className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-7"
      style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700) 70%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl animate-blob-a"
        style={{ background: hot ? "var(--color-brand-coral)" : "var(--color-brand-accent)" }}
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex-shrink-0 text-center sm:w-40">
          <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
            <CalendarClock className="h-3.5 w-3.5" />
            {copy.nextDeadline}
          </p>
          {days <= 1 ? (
            <p className="text-4xl font-extrabold leading-none text-[var(--color-brand-accent)] sm:text-5xl">
              {days === 0 ? copy.today : copy.tomorrow}
            </p>
          ) : (
            <>
              <p className="text-6xl font-extrabold leading-none tabular-nums text-[var(--color-brand-accent)] sm:text-7xl">
                {days}
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {copy.daysLeft}
              </p>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {copy.kind[event.kind]}
          </p>
          <h2 className="mt-0.5 text-xl font-bold leading-snug sm:text-2xl">{name}</h2>
          <p className="mt-1 text-sm text-white/80">
            {formatDay(date, lang, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <Link
            href={`/dashboard/program/${entry.program.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {copy.viewProgram}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {then.length > 0 && (
        <div className="relative mt-6 border-t border-white/15 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/60">
            {copy.thenDue}
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {then.map((item) => (
              <li
                key={item.event.id}
                className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10"
              >
                <p className="truncate text-sm font-semibold">{programName(item.entry.program, lang)}</p>
                <p className="text-xs text-white/70">
                  {formatDay(parseDate(item.event.date) as Date, lang, { month: "short", day: "numeric" })}
                  {" · "}
                  {relativeDays(item.days, copy)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
