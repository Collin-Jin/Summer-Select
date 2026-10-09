import { describe, expect, it } from "vitest";
import { isSafeNextPath, loginUrl, requiresLogin } from "./access";

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
  it.each(["/admin", "/admin/users", "/dashboard/essays", "/dashboard/my-list", "/dashboard/originals"])(
    "protects %s",
    (path) => expect(requiresLogin(path)).toBe(true)
  );

  it.each(["/", "/login", "/dashboard", "/dashboard/program/ucsb-rmp", "/terms"])(
    "leaves %s public",
    (path) => expect(requiresLogin(path)).toBe(false)
  );

  it("does not match look-alike prefixes", () => {
    expect(requiresLogin("/administrator")).toBe(false);
    expect(requiresLogin("/dashboard/essays-archive")).toBe(false);
  });
});
