/**
 * Pure logic behind the My List planner: the admission-cycle window, deadline
 * events, urgency, sorting and calendar export. No React, no I/O, so it is easy
 * to test. All dates are calendar dates ("YYYY-MM-DD"); times of day and time
 * zones never matter for a deadline shown on a timeline.
 */
import type { FavoriteStatus, SummerProgram } from "@/lib/database.types";

// ── Statuses ─────────────────────────────────────────────────────────────────

export const STATUS_ORDER: FavoriteStatus[] = [
  "considering",
  "applying",
  "submitted",
  "accepted",
  "waitlisted",
  "rejected",
];

export const STATUS_META: Record<
  FavoriteStatus,
  { en: string; zh: string; color: string; bg: string }
> = {
  considering: { en: "Considering", zh: "考虑中", color: "#4E527F", bg: "#EEEEF7" },
  applying: { en: "Applying", zh: "准备申请", color: "#92600A", bg: "#FFF3CC" },
  submitted: { en: "Submitted", zh: "已提交", color: "#1D5FBF", bg: "#E4EEFC" },
  accepted: { en: "Accepted", zh: "已录取", color: "#0B7A4B", bg: "#DDF5E9" },
  waitlisted: { en: "Waitlisted", zh: "候补", color: "#A15C00", bg: "#FFEBD1" },
  rejected: { en: "Not accepted", zh: "未录取", color: "#B42318", bg: "#FDE7E7" },
};

/** Statuses where there is no more deadline to worry about. */
const DONE_STATUSES: ReadonlySet<FavoriteStatus> = new Set([
  "submitted",
  "accepted",
  "waitlisted",
  "rejected",
]);

export function isStatusDone(status: FavoriteStatus): boolean {
  return DONE_STATUSES.has(status);
}

// ── Dates ────────────────────────────────────────────────────────────────────

/** Parses "YYYY-MM-DD" (or an ISO timestamp) into a local calendar date. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  // Reject overflow such as 2026-02-31.
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}

export function daysUntil(date: string, today: Date = new Date()): number | null {
  const d = parseDate(date);
  return d ? daysBetween(today, d) : null;
}

export type Urgency = "passed" | "today" | "urgent" | "soon" | "upcoming";

/** passed < 0 days, today = 0, urgent ≤ 7, soon ≤ 30, otherwise upcoming. */
export function urgencyOf(days: number): Urgency {
  if (days < 0) return "passed";
  if (days === 0) return "today";
  if (days <= 7) return "urgent";
  if (days <= 30) return "soon";
  return "upcoming";
}

export const URGENCY_COLORS: Record<Urgency, { fg: string; bg: string; dot: string }> = {
  passed: { fg: "#94A3B8", bg: "#F1F5F9", dot: "#CBD5E1" },
  today: { fg: "#B42318", bg: "#FDE7E7", dot: "#FF6B6C" },
  urgent: { fg: "#B42318", bg: "#FDE7E7", dot: "#FF6B6C" },
  soon: { fg: "#92600A", bg: "#FFF3CC", dot: "#FFC145" },
  upcoming: { fg: "#4E527F", bg: "#EEEEF7", dot: "#5B5F97" },
};

// ── Admission cycle ──────────────────────────────────────────────────────────

export interface CycleWindow {
  /** Calendar year the cycle starts in, e.g. 2026 for the 2026–2027 cycle. */
  startYear: number;
  /** First day of the window (August 1 of `startYear`). */
  start: Date;
  /** Last day of the window (August 31 of `startYear + 1`). */
  end: Date;
  /** "2026–2027" */
  label: string;
}

/**
 * The admission cycle that contains `today`: August of one year through August
 * of the next (applications for the following summer are due in between).
 * In September 2026 and in March 2027 this is the 2026–2027 cycle.
 */
export function cycleWindow(today: Date = new Date()): CycleWindow {
  const startYear = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  return {
    startYear,
    start: new Date(startYear, 7, 1),
    end: new Date(startYear + 1, 7, 31),
    label: `${startYear}–${startYear + 1}`,
  };
}

/** The 13 calendar months of a cycle, August through the following August. */
export function cycleMonths(window: CycleWindow): { key: string; year: number; month: number }[] {
  return Array.from({ length: 13 }, (_, i) => {
    const d = new Date(window.startYear, 7 + i, 1);
    return { key: toMonthKey(d), year: d.getFullYear(), month: d.getMonth() };
  });
}

// ── Events ───────────────────────────────────────────────────────────────────

export type DeadlineKind = "opens" | "priority" | "regular";

export interface PlannerEvent {
  /** Stable id: `${programId}:${kind}:${date}` */
  id: string;
  programId: string;
  kind: DeadlineKind;
  /** "YYYY-MM-DD" */
  date: string;
}

const KIND_RANK: Record<DeadlineKind, number> = { opens: 0, priority: 1, regular: 2 };

type DatedProgram = Pick<
  SummerProgram,
  "lid" | "application_open_date" | "priority_deadline" | "regular_deadline"
>;

/** One event per usable date on each program, sorted by date. */
export function buildEvents(programs: DatedProgram[]): PlannerEvent[] {
  const events: PlannerEvent[] = [];
  const add = (programId: string, kind: DeadlineKind, raw: string | null) => {
    const d = parseDate(raw);
    if (!d) return;
    const date = toDateKey(d);
    events.push({ id: `${programId}:${kind}:${date}`, programId, kind, date });
  };
  for (const p of programs) {
    add(p.lid, "opens", p.application_open_date);
    add(p.lid, "priority", p.priority_deadline);
    add(p.lid, "regular", p.regular_deadline);
  }
  return events.sort(
    (a, b) => a.date.localeCompare(b.date) || KIND_RANK[a.kind] - KIND_RANK[b.kind]
  );
}

export const isDeadline = (e: PlannerEvent) => e.kind !== "opens";

export function eventDays(e: PlannerEvent, today: Date = new Date()): number {
  return daysBetween(today, parseDate(e.date) as Date);
}

/**
 * Upcoming deadlines (not opening dates), soonest first. Programs the user has
 * already submitted to, or heard back from, are skipped via `skipPrograms`.
 */
export function upcomingDeadlines(
  events: PlannerEvent[],
  today: Date = new Date(),
  skipPrograms: ReadonlySet<string> = new Set()
): PlannerEvent[] {
  return events.filter(
    (e) => isDeadline(e) && !skipPrograms.has(e.programId) && eventDays(e, today) >= 0
  );
}

export interface MonthGroup {
  key: string;
  year: number;
  month: number;
  events: PlannerEvent[];
}

/**
 * Splits events into the months of the cycle (only months that have events) and
 * the rest. `outside` holds events dated before or after the cycle.
 */
export function groupEventsByMonth(
  events: PlannerEvent[],
  window: CycleWindow
): { months: MonthGroup[]; outside: PlannerEvent[] } {
  const startKey = toDateKey(window.start);
  const endKey = toDateKey(window.end);
  const byMonth = new Map<string, PlannerEvent[]>();
  const outside: PlannerEvent[] = [];

  for (const e of events) {
    if (e.date < startKey || e.date > endKey) {
      outside.push(e);
      continue;
    }
    const key = e.date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), e]);
  }

  const months: MonthGroup[] = cycleMonths(window)
    .filter((m) => byMonth.has(m.key))
    .map((m) => ({ ...m, events: byMonth.get(m.key) as PlannerEvent[] }));

  return { months, outside };
}

// ── Sorting and totals ───────────────────────────────────────────────────────

export type SortMode = "deadline" | "rating" | "added" | "name";

export interface SortableEntry {
  programId: string;
  name: string;
  rating: number | null;
  createdAt: string | null;
  /** Soonest upcoming deadline date, or null. */
  nextDeadline: string | null;
}

/** Returns a new array; the input is not mutated. */
export function sortEntries<T extends SortableEntry>(entries: T[], mode: SortMode): T[] {
  const copy = [...entries];
  switch (mode) {
    case "deadline":
      // Soonest upcoming deadline first; programs without one go last.
      return copy.sort((a, b) => {
        if (a.nextDeadline && b.nextDeadline) return a.nextDeadline.localeCompare(b.nextDeadline);
        if (a.nextDeadline) return -1;
        if (b.nextDeadline) return 1;
        return a.name.localeCompare(b.name);
      });
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name));
    case "added":
      return copy.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/** Sum of application fees for the given programs (unknown fees count as 0). */
export function totalApplicationFees(programs: Pick<SummerProgram, "application_fee">[]): {
  total: number;
  unknown: number;
} {
  let total = 0;
  let unknown = 0;
  for (const p of programs) {
    if (p.application_fee === null || p.application_fee === undefined) unknown += 1;
    else total += p.application_fee;
  }
  return { total, unknown };
}

// ── Calendar export (.ics) ───────────────────────────────────────────────────

const KIND_LABEL: Record<DeadlineKind, string> = {
  opens: "Applications open",
  priority: "Priority deadline",
  regular: "Application deadline",
};

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Folds a content line to at most 75 UTF-8 octets per line (RFC 5545 §3.1). */
export function icsFold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    // Continuation lines start with a space, which counts toward the limit.
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.map((l, i) => (i === 0 ? l : ` ${l}`)).join("\r\n");
}

const compact = (dateKey: string) => dateKey.replace(/-/g, "");

/**
 * Builds an iCalendar file with an all-day event per deadline (and opening
 * date), each with reminders a week and a day ahead.
 */
export function buildIcs(
  events: PlannerEvent[],
  programName: (programId: string) => string,
  now: Date = new Date()
): string {
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Summer Select//My List//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Summer Select deadlines",
  ];

  for (const e of events) {
    const name = programName(e.programId);
    const start = parseDate(e.date) as Date;
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const summary = `${KIND_LABEL[e.kind]}: ${name}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@summer-select`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.date)}`,
      `DTEND;VALUE=DATE:${compact(toDateKey(end))}`,
      `SUMMARY:${icsEscape(summary)}`,
      "TRANSP:TRANSPARENT"
    );
    if (e.kind !== "opens") {
      for (const trigger of ["-P7D", "-P1D"]) {
        lines.push(
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:${icsEscape(summary)}`,
          `TRIGGER:${trigger}`,
          "END:VALARM"
        );
      }
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(icsFold).join("\r\n") + "\r\n";
}
