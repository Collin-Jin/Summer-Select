/**
 * First and last name collected at sign-up. Stored in the account metadata
 * (`first_name`, `last_name`) and shown to the admin on the Members page.
 */

export const NAME_MAX_LENGTH = 60;

// Letters in any script (so 王, José and O'Brien all work), with spaces,
// hyphens, apostrophes and periods allowed inside.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;

/** Trims and collapses runs of whitespace. */
export function normalizeName(raw: unknown): string {
  return String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export type NameValidation =
  | { ok: true; firstName: string; lastName: string }
  | { ok: false; error: string };

export function validateNames(first: unknown, last: unknown): NameValidation {
  const firstName = normalizeName(first);
  const lastName = normalizeName(last);

  if (!firstName) return { ok: false, error: "Please enter your first name." };
  if (!lastName) return { ok: false, error: "Please enter your last name." };

  for (const [label, value] of [
    ["first", firstName],
    ["last", lastName],
  ] as const) {
    if (value.length > NAME_MAX_LENGTH) {
      return { ok: false, error: `Your ${label} name is too long (maximum ${NAME_MAX_LENGTH} characters).` };
    }
    if (!NAME_RE.test(value)) {
      return { ok: false, error: `Your ${label} name can only contain letters, spaces, hyphens and apostrophes.` };
    }
  }

  return { ok: true, firstName, lastName };
}

/** "First Last", or whichever part exists, or null when there is no name. */
export function fullName(first: string | null | undefined, last: string | null | undefined): string | null {
  const name = [first, last]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return name || null;
}
