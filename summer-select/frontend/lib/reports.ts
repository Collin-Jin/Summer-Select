/**
 * Problem reports: what a visitor may submit and how it is cleaned up before it
 * is stored. The same limits are enforced by check constraints in the database.
 */

export const REPORT_LIMITS = {
  messageMin: 3,
  messageMax: 2000,
  emailMax: 200,
  pathMax: 500,
} as const;

export type ReportStatus = "open" | "resolved";

export interface ReportInput {
  message: string;
  /** Page the visitor was on (path and query; an absolute URL is reduced to this). */
  pageUrl?: string | null;
  /** Optional contact address for visitors who are not signed in. */
  email?: string | null;
}

export interface CleanReport {
  message: string;
  pageUrl: string | null;
  email: string | null;
}

export type ReportValidation =
  | { ok: true; value: CleanReport }
  | { ok: false; error: string; field: "message" | "email" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keeps only the path and query of a page address, and never anything off-site. */
export function normalizePagePath(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  let path = value;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      path = `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path.slice(0, REPORT_LIMITS.pathMax);
}

export function validateReport(input: ReportInput): ReportValidation {
  const message = (input.message ?? "").replace(/\r\n/g, "\n").trim();
  if (message.length < REPORT_LIMITS.messageMin) {
    return { ok: false, field: "message", error: "Please describe what went wrong." };
  }
  if (message.length > REPORT_LIMITS.messageMax) {
    return {
      ok: false,
      field: "message",
      error: `That is too long (maximum ${REPORT_LIMITS.messageMax.toLocaleString("en-US")} characters).`,
    };
  }

  const email = (input.email ?? "").trim();
  if (email && (email.length > REPORT_LIMITS.emailMax || !EMAIL_RE.test(email))) {
    return { ok: false, field: "email", error: "That email address doesn't look right." };
  }

  return {
    ok: true,
    value: {
      message,
      pageUrl: normalizePagePath(input.pageUrl),
      email: email || null,
    },
  };
}
