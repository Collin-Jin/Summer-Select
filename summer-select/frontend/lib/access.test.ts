import { describe, expect, it } from "vitest";
import { isRegistered, isSafeNextPath, loginUrl, requiresLogin, signinUrl, signupUrl } from "./access";

describe("isSafeNextPath", () => {
  it("accepts same-site relative paths", () => {
    expect(isSafeNextPath("/dashboard")).toBe(true);
    expect(isSafeNextPath("/dashboard/essays?x=1")).toBe(true);
  });

  it.each([
    ["absolute URL", "https://evil.example"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path", "dashboard"],
    ["empty string", ""],
    ["null", null],
    ["undefined", undefined],
  ])("rejects %s", (_name, value) => {
    expect(isSafeNextPath(value)).toBe(false);
  });
});

describe("loginUrl", () => {
  it("always carries the login_required reason", () => {
    expect(loginUrl()).toBe("/login?reason=login_required");
  });

  it("keeps a safe next path, URL-encoded", () => {
    expect(loginUrl("/dashboard/essays")).toBe(
      "/login?reason=login_required&next=%2Fdashboard%2Fessays"
    );
  });

  it("drops an unsafe next path", () => {
    expect(loginUrl("//evil.example")).toBe("/login?reason=login_required");
  });
});

describe("requiresLogin", () => {
  it.each(["/admin", "/admin/users", "/dashboard/my-list", "/dashboard/originals"])(
    "protects %s",
    (path) => expect(requiresLogin(path)).toBe(true)
  );

  // Paid-only pages show a blurred preview to guests instead of redirecting.
  it.each([
    "/",
    "/login",
    "/dashboard",
    "/dashboard/program/ucsb-rmp",
    "/dashboard/essays",
    "/dashboard/evaluate",
    "/dashboard/interviews",
    "/terms",
  ])("leaves %s public", (path) => expect(requiresLogin(path)).toBe(false));

  it("does not match look-alike prefixes", () => {
    expect(requiresLogin("/administrator")).toBe(false);
    expect(requiresLogin("/dashboard/my-list-archive")).toBe(false);
  });
});

describe("signupUrl / signinUrl", () => {
  it("opens the sign-up tab and keeps a safe next path", () => {
    expect(signupUrl("/dashboard/essays")).toBe("/login?tab=signup&next=%2Fdashboard%2Fessays");
    expect(signupUrl()).toBe("/login?tab=signup");
  });

  it("drops an unsafe next path", () => {
    expect(signupUrl("https://evil.example")).toBe("/login?tab=signup");
    expect(signinUrl("//evil.example")).toBe("/login");
  });

  it("builds a plain sign-in link", () => {
    expect(signinUrl("/dashboard/essays")).toBe("/login?next=%2Fdashboard%2Fessays");
  });
});

describe("isRegistered", () => {
  it("is true for free and paid accounts only", () => {
    expect(isRegistered("guest")).toBe(false);
    expect(isRegistered("unpaid")).toBe(true);
    expect(isRegistered("paid")).toBe(true);
  });
});
