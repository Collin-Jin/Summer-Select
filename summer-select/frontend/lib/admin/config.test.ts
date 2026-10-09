import { describe, expect, it } from "vitest";
import { ADMIN_EMAILS, isAdminEmail } from "./config";

describe("isAdminEmail", () => {
  it("recognises the admin regardless of case and surrounding whitespace", () => {
    const [admin] = ADMIN_EMAILS;
    expect(isAdminEmail(admin)).toBe(true);
    expect(isAdminEmail(`  ${admin.toUpperCase()} `)).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isAdminEmail("someone@example.com")).toBe(false);
    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
