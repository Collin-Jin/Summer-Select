/**
 * Requests for a summer program to be added to the directory: what a visitor may
 * submit and how it is cleaned up before it is stored. The same limits are
 * enforced by check constraints in the database.
 */

export const PROGRAM_REQUEST_LIMITS = {
  nameMin: 2,
  nameMax: 150,
  urlMax: 500,
  notesMax: 1000,
  emailMax: 200,
} as const;

/** How long the visitor is told to expect before the program appears. */
export const PROGRAM_REQUEST_TURNAROUND_DAYS = 7;

export type ProgramRequestStatus = "pending" | "added" | "declined";

export interface ProgramRequestInput {
  programName: string;
  /** The program's website, if the visitor knows it. */
  programUrl?: string | null;
  /** Anything that helps identify the program or explains why it is wanted. */
  notes?: string | null;
  /** Optional contact address for visitors who are not signed in. */
  email?: string | null;
}

export interface CleanProgramRequest {
  programName: string;
  programUrl: string | null;
  notes: string | null;
  email: string | null;
}

export type ProgramRequestField = "programName" | "programUrl" | "notes" | "email";

export type ProgramRequestValidation =
  | { ok: true; value: CleanProgramRequest }
  | { ok: false; error: string; field: ProgramRequestField };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Accepts "example.org/summer" as well as a full address, and returns a
 * web address (http or https only) or null when it can't be one.
 */
export function normalizeProgramUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value || /\s/.test(value)) return null;

  const withScheme = value.includes("://") ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password || !url.hostname.includes(".")) return null;

  const result = url.toString();
  return result.length > PROGRAM_REQUEST_LIMITS.urlMax ? null : result;
}

export function validateProgramRequest(input: ProgramRequestInput): ProgramRequestValidation {
  const programName = (input.programName ?? "").replace(/\s+/g, " ").trim();
  if (programName.length < PROGRAM_REQUEST_LIMITS.nameMin) {
    return { ok: false, field: "programName", error: "Please enter the program's name." };
  }
  if (programName.length > PROGRAM_REQUEST_LIMITS.nameMax) {
    return {
      ok: false,
      field: "programName",
      error: `That name is too long (maximum ${PROGRAM_REQUEST_LIMITS.nameMax} characters).`,
    };
  }

  const rawUrl = (input.programUrl ?? "").trim();
  let programUrl: string | null = null;
  if (rawUrl) {
    programUrl = normalizeProgramUrl(rawUrl);
    if (!programUrl) {
      return { ok: false, field: "programUrl", error: "That doesn't look like a web address." };
    }
  }

  const notes = (input.notes ?? "").replace(/\r\n/g, "\n").trim();
  if (notes.length > PROGRAM_REQUEST_LIMITS.notesMax) {
    return {
      ok: false,
      field: "notes",
      error: `That is too long (maximum ${PROGRAM_REQUEST_LIMITS.notesMax.toLocaleString("en-US")} characters).`,
    };
  }

  const email = (input.email ?? "").trim();
  if (email && (email.length > PROGRAM_REQUEST_LIMITS.emailMax || !EMAIL_RE.test(email))) {
    return { ok: false, field: "email", error: "That email address doesn't look right." };
  }

  return {
    ok: true,
    value: { programName, programUrl, notes: notes || null, email: email || null },
  };
}
