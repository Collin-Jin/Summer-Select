import { describe, expect, it } from "vitest";
import { describeDevice, describeLocation } from "./device";

describe("describeDevice", () => {
  it("recognises common desktop browsers", () => {
    expect(
      describeDevice(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
      )
    ).toBe("Chrome on macOS");
    expect(
      describeDevice(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0"
      )
    ).toBe("Edge on Windows");
    expect(describeDevice("Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0")).toBe(
      "Firefox on Linux"
    );
  });

  it("recognises mobile browsers", () => {
    expect(
      describeDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
      )
    ).toBe("Safari on iOS");
    expect(
      describeDevice(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
      )
    ).toBe("Chrome on Android");
  });

  it("falls back when it cannot tell", () => {
    expect(describeDevice("")).toBe("Unknown device");
    expect(describeDevice(null)).toBe("Unknown device");
    expect(describeDevice("curl/8.0")).toBe("Unknown device");
  });
});

describe("describeLocation", () => {
  it("joins what is known", () => {
    expect(describeLocation("Chicago", "US")).toBe("Chicago, US");
    expect(describeLocation(null, "US")).toBe("US");
    expect(describeLocation(null, null)).toBeNull();
  });
});
