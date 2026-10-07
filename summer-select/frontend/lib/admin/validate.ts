import type { FieldDef, ResourceDef, Values } from "./resources";

export type FieldErrors = Record<string, string>;

const MAX_TEXT = 500;
const MAX_TEXTAREA = 30_000;
const MAX_TAGS = 60;
const MAX_TAG_LENGTH = 100;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function readString(fd: FormData, name: string): string {
  const raw = fd.get(name);
  return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
}

function readAll(fd: FormData, name: string): string[] {
  return fd
    .getAll(name)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim());
}

/** Parses and validates one field. Returns [value, errorMessage | null]. */
function parseField(field: FieldDef, fd: FormData): [unknown, string | null] {
  const required = (msg = "This field is required.") => (field.required ? msg : null);

  switch (field.type) {
    case "text":
    case "textarea":
    case "url": {
      const raw = readString(fd, field.name);
      if (!raw) return [null, required()];
      const max = field.max ?? (field.type === "textarea" ? MAX_TEXTAREA : MAX_TEXT);
      if (raw.length > max) return [raw, `Too long (maximum ${max.toLocaleString()} characters).`];
      if (field.slug && !SLUG_RE.test(raw)) {
        return [raw, "Use lowercase letters, numbers and single dashes only (e.g. ucsb-rmp)."];
      }
      if (field.type === "url") {
        const ok = isHttpUrl(raw) || (field.allowRelative && raw.startsWith("/") && !raw.startsWith("//"));
        if (!ok) return [raw, "Enter a full web address starting with http:// or https://."];
      }
      return [raw, null];
    }

    case "int":
    case "decimal": {
      const raw = readString(fd, field.name);
      if (!raw) return [null, required()];
      const n = Number(raw);
      if (!Number.isFinite(n)) return [raw, "Enter a number."];
      if (field.type === "int" && !Number.isInteger(n)) return [raw, "Enter a whole number."];
      if (field.min !== undefined && n < field.min) return [raw, `Must be ${field.min} or more.`];
      if (field.max !== undefined && n > field.max) return [raw, `Must be ${field.max} or less.`];
      return [n, null];
    }

    case "bool": {
      const raw = readString(fd, field.name);
      return [raw === "true", null];
    }

    case "tribool": {
      const raw = readString(fd, field.name);
      if (raw === "") return [null, required()];
      if (raw === "true") return [true, null];
      if (raw === "false") return [false, null];
      return [null, "Choose Yes, No, or leave it unspecified."];
    }

    case "date": {
      const raw = readString(fd, field.name);
      if (!raw) return [null, required()];
      if (!isValidDate(raw)) return [raw, "Enter a valid date."];
      return [raw, null];
    }

    case "tags": {
      const seen = new Set<string>();
      const items: string[] = [];
      for (const item of readAll(fd, field.name)) {
        const key = item.toLowerCase();
        if (!item || seen.has(key)) continue;
        if (item.length > MAX_TAG_LENGTH) return [items, `Each item can be at most ${MAX_TAG_LENGTH} characters.`];
        seen.add(key);
        items.push(item);
      }
      if (items.length > MAX_TAGS) return [items, `Too many items (maximum ${MAX_TAGS}).`];
      if (items.length === 0) return [null, required("Add at least one item.")];
      return [items, null];
    }

    case "intset": {
      const allowed = new Set((field.options ?? []).map((o) => o.value));
      const nums: number[] = [];
      for (const item of readAll(fd, field.name)) {
        if (!allowed.has(item)) return [nums, "One of the selected values isn't allowed."];
        const n = Number(item);
        if (!nums.includes(n)) nums.push(n);
      }
      nums.sort((a, b) => a - b);
      if (nums.length === 0) return [null, required("Select at least one.")];
      return [nums, null];
    }

    case "select": {
      const raw = readString(fd, field.name);
      if (!raw) return [null, required("Please choose an option.")];
      if (field.options && !field.options.some((o) => o.value === raw)) {
        return [raw, "That isn't one of the available options."];
      }
      return [raw, null];
    }
  }
}

export interface ParseResult {
  values: Values;
  errors: FieldErrors;
}

/**
 * Turns submitted form data into clean database values, or field errors.
 * On update, immutable fields are left out entirely so they can never change.
 */
export function parseForm(
  resource: ResourceDef,
  fd: FormData,
  mode: "create" | "update"
): ParseResult {
  const values: Values = {};
  const errors: FieldErrors = {};

  for (const field of resource.fields) {
    if (mode === "update" && field.immutable) continue;
    const [value, error] = parseField(field, fd);
    values[field.name] = value;
    if (error) errors[field.name] = error;
  }

  if (Object.keys(errors).length === 0 && resource.crossValidate) {
    Object.assign(errors, resource.crossValidate(values));
  }

  return { values, errors };
}
