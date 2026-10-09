import { format, formatDistanceToNow, differenceInCalendarDays, parseISO } from "date-fns";

/**
 * Converts a date string (ISO 8601 or YYYY-MM-DD) to a human-readable long date.
 *
 * @param date - ISO date string or null
 * @returns e.g. "May 15, 2026" or "—" when null
 *
 * @example
 * formatProgramDate("2026-05-15") // "May 15, 2026"
 */
export function formatProgramDate(date: string | null | undefined): string {
  if (!date) return "—";
  try {
    return format(parseISO(date), "MMMM d, yyyy");
  } catch {
    return "—";
  }
}

/**
 * Returns a short date format suitable for compact badges.
 *
 * @param date - ISO date string or null
 * @returns e.g. "May 15" or "—"
 */
export function formatShortDate(date: string | null | undefined): string {
  if (!date) return "—";
  try {
    return format(parseISO(date), "MMM d");
  } catch {
    return "—";
  }
}

/**
 * Computes how many calendar days remain until a given date.
 *
 * @param date - ISO date string or null
 * @returns Positive integer for future dates, negative for past, or null when date is null
 */
export function getDaysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  try {
    return differenceInCalendarDays(parseISO(date), new Date());
  } catch {
    return null;
  }
}

/**
 * Returns a UI urgency label describing the time remaining until a deadline.
 *
 * Urgency tiers:
 *   - "Closed"    → deadline has passed
 *   - "Urgent"    → ≤ 7 days remaining
 *   - "Soon"      → 8–30 days remaining
 *   - "Open"      → > 30 days remaining
 *   - null        → no deadline
 *
 * @param date - ISO date string representing the application deadline
 * @returns Label string or null
 */
export function getDeadlineLabel(
  date: string | null | undefined
): { label: string; tier: "closed" | "urgent" | "soon" | "open" } | null {
  const days = getDaysUntil(date);
  if (days === null) return null;
  if (days < 0) return { label: "Closed", tier: "closed" };
  if (days <= 7) return { label: `${days}d left`, tier: "urgent" };
  if (days <= 30) return { label: `${days}d left`, tier: "soon" };
  return { label: formatShortDate(date), tier: "open" };
}

/**
 * Formats a program duration range for display.
 *
 * @param start - ISO date string for program start
 * @param end   - ISO date string for program end
 * @returns e.g. "Jun 23 – Aug 2, 2026"
 */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start && !end) return "Dates TBD";
  if (!start) return `Ends ${formatProgramDate(end)}`;
  if (!end) return `Starts ${formatProgramDate(start)}`;
  try {
    return `${format(parseISO(start), "MMM d")} – ${format(parseISO(end), "MMM d, yyyy")}`;
  } catch {
    return "—";
  }
}

/**
 * Returns a relative human-readable distance string, e.g. "in 3 months".
 *
 * @param date - ISO date string or null
 */
export function formatRelativeDate(date: string | null | undefined): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return "—";
  }
}
