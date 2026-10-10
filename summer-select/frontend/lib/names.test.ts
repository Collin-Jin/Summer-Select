import { describe, expect, it } from "vitest";
import { fullName, NAME_MAX_LENGTH, normalizeName, validateNames } from "./names";

describe("normalizeName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeName("  Mary   Ann ")).toBe("Mary Ann");
  });

  it("handles missing values", () => {
    expect(normalizeName(null)).toBe("");
    expect(normalizeName(undefined)).toBe("");
  });
});

describe("validateNames", () => {
  it("accepts ordinary names", () => {
    expect(validateNames("Collin", "Jin")).toEqual({ ok: true, firstName: "Collin", lastName: "Jin" });
  });

  it("accepts names from other scripts, hyphens and apostrophes", () => {
    expect(validateNames("伟", "王").ok).toBe(true);
    expect(validateNames("José", "García-López").ok).toBe(true);
    expect(validateNames("Siobhán", "O'Brien").ok).toBe(true);
    expect(validateNames("Mary Ann", "St. John").ok).toBe(true);
  });

  it("cleans up whitespace", () => {
    expect(validateNames("  Ada ", " Lovelace  ")).toEqual({ ok: true, firstName: "Ada", lastName: "Lovelace" });
  });

  it("requires both names", () => {
    expect(validateNames("", "Jin")).toEqual({ ok: false, error: "Please enter your first name." });
    expect(validateNames("Collin", "   ")).toEqual({ ok: false, error: "Please enter your last name." });
  });

  it("rejects digits, symbols and markup", () => {
    expect(validateNames("C0llin", "Jin").ok).toBe(false);
    expect(validateNames("Collin", "<script>").ok).toBe(false);
    expect(validateNames("-Collin", "Jin").ok).toBe(false);
  });

  it("rejects over-long names", () => {
    expect(validateNames("a".repeat(NAME_MAX_LENGTH + 1), "Jin").ok).toBe(false);
    expect(validateNames("a".repeat(NAME_MAX_LENGTH), "Jin").ok).toBe(true);
  });
});

describe("fullName", () => {
  it("joins the parts that exist", () => {
    expect(fullName("Collin", "Jin")).toBe("Collin Jin");
    expect(fullName("Collin", null)).toBe("Collin");
    expect(fullName(null, "Jin")).toBe("Jin");
    expect(fullName(" ", null)).toBeNull();
  });
});
