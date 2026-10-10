import { describe, expect, it } from "vitest";
import { normalizeProgramUrl, PROGRAM_REQUEST_LIMITS, validateProgramRequest } from "./programRequests";

describe("normalizeProgramUrl", () => {
  it("keeps full web addresses", () => {
    expect(normalizeProgramUrl("https://www.example.org/summer")).toBe("https://www.example.org/summer");
    expect(normalizeProgramUrl("http://example.org")).toBe("http://example.org/");
  });

  it("adds https when the scheme is missing", () => {
    expect(normalizeProgramUrl("example.org/summer")).toBe("https://example.org/summer");
  });

  it("rejects anything that is not a plain web address", () => {
    expect(normalizeProgramUrl("")).toBeNull();
    expect(normalizeProgramUrl("not a url")).toBeNull();
    expect(normalizeProgramUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeProgramUrl("ftp://example.org/file")).toBeNull();
    expect(normalizeProgramUrl("mailto:a@b.co")).toBeNull();
    expect(normalizeProgramUrl("localhost")).toBeNull();
    expect(normalizeProgramUrl("https://user:pw@example.org")).toBeNull();
  });

  it("rejects addresses that are too long", () => {
    expect(normalizeProgramUrl(`https://example.org/${"a".repeat(PROGRAM_REQUEST_LIMITS.urlMax)}`)).toBeNull();
  });
});

describe("validateProgramRequest", () => {
  it("accepts a name alone and tidies whitespace", () => {
    const result = validateProgramRequest({ programName: "  Stanford   Summer\nSession " });
    expect(result).toEqual({
      ok: true,
      value: { programName: "Stanford Summer Session", programUrl: null, notes: null, email: null },
    });
  });

  it("keeps the optional fields when given", () => {
    const result = validateProgramRequest({
      programName: "RISE",
      programUrl: "rise.example.org",
      notes: "  Heard about it from a friend. ",
      email: " a@b.co ",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        programName: "RISE",
        programUrl: "https://rise.example.org/",
        notes: "Heard about it from a friend.",
        email: "a@b.co",
      },
    });
  });

  it("requires a name", () => {
    expect(validateProgramRequest({ programName: "   " })).toMatchObject({ ok: false, field: "programName" });
    expect(validateProgramRequest({ programName: "x" })).toMatchObject({ ok: false, field: "programName" });
  });

  it("limits the name and notes", () => {
    expect(
      validateProgramRequest({ programName: "a".repeat(PROGRAM_REQUEST_LIMITS.nameMax + 1) })
    ).toMatchObject({ ok: false, field: "programName" });
    expect(
      validateProgramRequest({ programName: "RISE", notes: "a".repeat(PROGRAM_REQUEST_LIMITS.notesMax + 1) })
    ).toMatchObject({ ok: false, field: "notes" });
  });

  it("rejects a bad web address or email", () => {
    expect(validateProgramRequest({ programName: "RISE", programUrl: "nope nope" })).toMatchObject({
      ok: false,
      field: "programUrl",
    });
    expect(validateProgramRequest({ programName: "RISE", email: "nope" })).toMatchObject({
      ok: false,
      field: "email",
    });
  });
});
