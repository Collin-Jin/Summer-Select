import { describe, expect, it } from "vitest";
import { parseForm } from "./validate";
import type { FieldDef, ResourceDef } from "./resources";

/** A minimal resource; only the fields matter to parseForm. */
function resourceWith(fields: FieldDef[], crossValidate?: ResourceDef["crossValidate"]): ResourceDef {
  return {
    key: "test",
    table: "test",
    label: "Tests",
    singular: "test",
    description: "",
    pk: "id",
    fields,
    sections: [],
    columns: [],
    searchColumns: [],
    order: [],
    labelColumns: [],
    title: () => "",
    crossValidate,
  };
}

function form(entries: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
  }
  return fd;
}

const text = (extra: Partial<FieldDef> = {}): FieldDef => ({ name: "f", label: "F", type: "text", ...extra });

describe("text fields", () => {
  it("trims, normalises newlines and stores empty optional text as null", () => {
    const r = parseForm(resourceWith([text()]), form({ f: "  a\r\nb  " }), "create");
    expect(r.errors).toEqual({});
    expect(r.values.f).toBe("a\nb");

    expect(parseForm(resourceWith([text()]), form({ f: "   " }), "create").values.f).toBeNull();
  });

  it("requires a value when marked required", () => {
    const r = parseForm(resourceWith([text({ required: true })]), form({}), "create");
    expect(r.errors.f).toBe("This field is required.");
  });

  it("enforces the maximum length", () => {
    const r = parseForm(resourceWith([text({ max: 3 })]), form({ f: "abcd" }), "create");
    expect(r.errors.f).toMatch(/Too long/);
  });

  it("validates slugs", () => {
    const res = resourceWith([text({ slug: true })]);
    expect(parseForm(res, form({ f: "ucsb-rmp" }), "create").errors).toEqual({});
    for (const bad of ["UCSB", "a--b", "-a", "a b", "a_b"]) {
      expect(parseForm(res, form({ f: bad }), "create").errors.f, bad).toMatch(/lowercase/);
    }
  });
});

describe("url fields", () => {
  const res = resourceWith([{ name: "u", label: "U", type: "url", allowRelative: true }]);

  it("accepts http(s) and site-relative URLs", () => {
    for (const ok of ["https://example.com/a", "http://example.com", "/logo.png"]) {
      expect(parseForm(res, form({ u: ok }), "create").errors, ok).toEqual({});
    }
  });

  it("rejects other schemes and protocol-relative URLs", () => {
    for (const bad of ["javascript:alert(1)", "ftp://x.test", "//evil.test", "example.com"]) {
      expect(parseForm(res, form({ u: bad }), "create").errors.u, bad).toBeDefined();
    }
  });
});

describe("numeric fields", () => {
  const int = (extra: Partial<FieldDef> = {}): FieldDef => ({ name: "n", label: "N", type: "int", ...extra });

  it("parses numbers", () => {
    expect(parseForm(resourceWith([int()]), form({ n: "42" }), "create").values.n).toBe(42);
  });

  it("rejects non-numbers, fractions for ints and out-of-range values", () => {
    expect(parseForm(resourceWith([int()]), form({ n: "abc" }), "create").errors.n).toBe("Enter a number.");
    expect(parseForm(resourceWith([int()]), form({ n: "1.5" }), "create").errors.n).toBe("Enter a whole number.");
    expect(parseForm(resourceWith([int({ min: 1 })]), form({ n: "0" }), "create").errors.n).toBe("Must be 1 or more.");
    expect(parseForm(resourceWith([int({ max: 10 })]), form({ n: "11" }), "create").errors.n).toBe("Must be 10 or less.");
  });

  it("allows decimals", () => {
    const res = resourceWith([{ name: "d", label: "D", type: "decimal" }]);
    expect(parseForm(res, form({ d: "3.5" }), "create").values.d).toBe(3.5);
  });
});

describe("booleans", () => {
  it("reads a switch as true only for 'true'", () => {
    const res = resourceWith([{ name: "b", label: "B", type: "bool" }]);
    expect(parseForm(res, form({ b: "true" }), "create").values.b).toBe(true);
    expect(parseForm(res, form({}), "create").values.b).toBe(false);
  });

  it("keeps tribool unset as null and rejects junk", () => {
    const res = resourceWith([{ name: "t", label: "T", type: "tribool" }]);
    expect(parseForm(res, form({ t: "" }), "create").values.t).toBeNull();
    expect(parseForm(res, form({ t: "false" }), "create").values.t).toBe(false);
    expect(parseForm(res, form({ t: "maybe" }), "create").errors.t).toBeDefined();
  });
});

describe("dates", () => {
  const res = resourceWith([{ name: "d", label: "D", type: "date" }]);

  it("accepts real calendar dates only", () => {
    expect(parseForm(res, form({ d: "2026-02-28" }), "create").errors).toEqual({});
    expect(parseForm(res, form({ d: "2026-02-30" }), "create").errors.d).toBe("Enter a valid date.");
    expect(parseForm(res, form({ d: "02/28/2026" }), "create").errors.d).toBe("Enter a valid date.");
  });
});

describe("lists", () => {
  it("trims tags and drops blanks and case-insensitive duplicates", () => {
    const res = resourceWith([{ name: "tags", label: "Tags", type: "tags" }]);
    const r = parseForm(res, form({ tags: [" AI ", "ai", "", "Biology"] }), "create");
    expect(r.values.tags).toEqual(["AI", "Biology"]);
  });

  it("requires at least one tag when required", () => {
    const res = resourceWith([{ name: "tags", label: "Tags", type: "tags", required: true }]);
    expect(parseForm(res, form({ tags: [""] }), "create").errors.tags).toBe("Add at least one item.");
  });

  it("only accepts allowed integer-set values and sorts them", () => {
    const res = resourceWith([
      {
        name: "grades",
        label: "Grades",
        type: "intset",
        options: [9, 10, 11].map((n) => ({ value: String(n), label: `Grade ${n}` })),
      },
    ]);
    expect(parseForm(res, form({ grades: ["11", "9", "11"] }), "create").values.grades).toEqual([9, 11]);
    expect(parseForm(res, form({ grades: ["12"] }), "create").errors.grades).toBeDefined();
  });

  it("restricts selects to the declared options", () => {
    const res = resourceWith([
      { name: "s", label: "S", type: "select", required: true, options: [{ value: "a", label: "A" }] },
    ]);
    expect(parseForm(res, form({ s: "a" }), "create").errors).toEqual({});
    expect(parseForm(res, form({ s: "b" }), "create").errors.s).toBeDefined();
    expect(parseForm(res, form({}), "create").errors.s).toBeDefined();
  });
});

describe("update vs create", () => {
  it("leaves immutable fields out of updates so they cannot change", () => {
    const res = resourceWith([text({ name: "slug", immutable: true }), text({ name: "title" })]);
    const fd = form({ slug: "changed", title: "t" });
    expect("slug" in parseForm(res, fd, "update").values).toBe(false);
    expect(parseForm(res, fd, "create").values.slug).toBe("changed");
  });
});

describe("crossValidate", () => {
  const res = resourceWith(
    [
      { name: "start", label: "Start", type: "date" },
      { name: "end", label: "End", type: "date" },
    ],
    (v): Record<string, string> =>
      v.start && v.end && String(v.end) < String(v.start) ? { end: "End must be after start." } : {}
  );

  it("runs only after field-level validation passes", () => {
    expect(parseForm(res, form({ start: "2026-06-01", end: "2026-05-01" }), "create").errors).toEqual({
      end: "End must be after start.",
    });
    expect(parseForm(res, form({ start: "bad", end: "2026-05-01" }), "create").errors).toEqual({
      start: "Enter a valid date.",
    });
  });
});
