import { describe, expect, it } from "vitest";
import { normalizePagePath, REPORT_LIMITS, validateReport } from "./reports";

describe("normalizePagePath", () => {
  it("keeps site paths and queries", () => {
    expect(normalizePagePath("/dashboard/program/ssp?x=1")).toBe("/dashboard/program/ssp?x=1");
  });

  it("reduces an absolute address to its path", () => {
    expect(normalizePagePath("https://example.com/dashboard/essays?program=ssp#top")).toBe(
      "/dashboard/essays?program=ssp"
    );
  });

  it("rejects empty, relative and protocol-relative values", () => {
    expect(normalizePagePath("")).toBeNull();
    expect(normalizePagePath(null)).toBeNull();
    expect(normalizePagePath("dashboard")).toBeNull();
    expect(normalizePagePath("//evil.example/x")).toBeNull();
    expect(normalizePagePath("javascript:alert(1)")).toBeNull();
  });

  it("caps the length", () => {
    expect(normalizePagePath(`/${"a".repeat(2000)}`)).toHaveLength(REPORT_LIMITS.pathMax);
  });
});

describe("validateReport", () => {
  it("accepts a normal report and trims it", () => {
    const result = validateReport({ message: "  The deadline is wrong.  ", pageUrl: "/dashboard", email: " a@b.co " });
    expect(result).toEqual({
      ok: true,
      value: { message: "The deadline is wrong.", pageUrl: "/dashboard", email: "a@b.co" },
    });
  });

  it("treats the email as optional", () => {
    const result = validateReport({ message: "Broken link on this page" });
    expect(result.ok && result.value.email).toBeNull();
    expect(result.ok && result.value.pageUrl).toBeNull();
  });

  it("rejects empty and too-short messages", () => {
    expect(validateReport({ message: "   " }).ok).toBe(false);
    expect(validateReport({ message: "hi" }).ok).toBe(false);
  });

  it("rejects over-long messages", () => {
    const result = validateReport({ message: "x".repeat(REPORT_LIMITS.messageMax + 1) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe("message");
  });

  it("rejects a malformed email", () => {
    const result = validateReport({ message: "Something broke", email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe("email");
  });
});
