/**
 * Financial formatting utilities for Summer Select.
 * All functions handle null/undefined gracefully, returning "—" or sensible defaults.
 */

/**
 * Formats a numeric dollar amount as USD currency.
 * Returns "Free" for zero-cost values.
 *
 * @param value - Dollar amount as a number or null
 * @returns e.g. "$3,500", "$0", "Free", or "—"
 *
 * @example
 * formatCost(3500)  // "$3,500"
 * formatCost(0)     // "Free"
 * formatCost(null)  // "—"
 */
export function formatCost(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats an application fee, with special handling for the free-to-apply case.
 *
 * @param fee - Application fee in USD or null
 * @returns e.g. "$75", "Free to apply", or "—"
 */
export function formatAppFee(fee: number | null | undefined): string {
  if (fee === null || fee === undefined) return "—";
  if (fee === 0) return "Free to apply";
  return `${formatCost(fee)} application fee`;
}

/**
 * Returns a labeled stipend string when the program pays students.
 *
 * @param isPaidStipend - Whether the program offers a stipend
 * @param amount        - Stipend dollar amount
 * @returns e.g. "$2,000 stipend", "Stipend (amount TBD)", or "None"
 */
export function formatStipend(
  isPaidStipend: boolean | null | undefined,
  amount: number | null | undefined
): string {
  if (!isPaidStipend) return "None";
  if (!amount) return "Stipend (amount TBD)";
  return `${formatCost(amount)} stipend`;
}

/**
 * Formats an acceptance rate percentage with a tilde to convey approximation.
 *
 * @param rate - Decimal or percentage value (values > 1 treated as already a %; values ≤ 1 multiplied by 100)
 * @returns e.g. "~8%", "~45%", or "—"
 *
 * @example
 * formatAcceptanceRate(0.08)  // "~8%"
 * formatAcceptanceRate(8)     // "~8%"
 */
export function formatAcceptanceRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return "—";
  const pct = rate <= 1 ? rate * 100 : rate;
  return `~${Math.round(pct)}%`;
}

/**
 * Formats a GPA value to one decimal place.
 *
 * @param gpa - GPA on a 4.0 scale or null
 * @returns e.g. "3.5 GPA minimum" or "No minimum"
 */
export function formatGpa(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) return "No minimum";
  return `${gpa.toFixed(1)} GPA minimum`;
}

/**
 * Formats an array of eligible grade levels into a readable string.
 *
 * @param grades - Array of integers representing US grade levels
 * @returns e.g. "Grades 10–12", "Grade 11", or "All grades"
 */
export function formatEligibleGrades(
  grades: number[] | null | undefined
): string {
  if (!grades || grades.length === 0) return "All grades";
  const sorted = [...grades].sort((a, b) => a - b);
  if (sorted.length === 1) return `Grade ${sorted[0]}`;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const isContiguous = sorted.every((g, i) => i === 0 || g === sorted[i - 1] + 1);
  return isContiguous ? `Grades ${min}–${max}` : `Grades ${sorted.join(", ")}`;
}
