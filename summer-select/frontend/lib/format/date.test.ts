import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDateRange,
  formatProgramDate,
  formatShortDate,
  getDaysUntil,
  getDeadlineLabel,
} from "./date";

describe("date formatting", () => {
  it("formats long and short dates", () => {
    expect(formatProgramDate("2026-05-15")).toBe("May 15, 2026");
    expect(formatShortDate("2026-05-15")).toBe("May 15");
  });

  it("falls back to a dash for missing or invalid input", () => {
    expect(formatProgramDate(null)).toBe("—");
    expect(formatShortDate("not-a-date")).toBe("—");
  });

  it("describes duration ranges", () => {
    expect(formatDateRange("2026-06-23", "2026-08-02")).toBe("Jun 23 – Aug 2, 2026");
    expect(formatDateRange("2026-12-20", "2027-01-05")).toBe("Dec 20 – Jan 5, 2027");
    expect(formatDateRange(null, null)).toBe("Dates TBD");
    expect(formatDateRange("2026-06-23", null)).toBe("Starts June 23, 2026");
    expect(formatDateRange(null, "2026-08-02")).toBe("Ends August 2, 2026");
  });
});

describe("deadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("counts calendar days until a date", () => {
    expect(getDaysUntil("2026-01-15")).toBe(5);
    expect(getDaysUntil("2026-01-05")).toBe(-5);
    expect(getDaysUntil(null)).toBeNull();
  });

  it("assigns an urgency tier", () => {
    expect(getDeadlineLabel("2026-01-05")).toEqual({ label: "Closed", tier: "closed" });
    expect(getDeadlineLabel("2026-01-15")).toEqual({ label: "5d left", tier: "urgent" });
    expect(getDeadlineLabel("2026-01-17")).toEqual({ label: "7d left", tier: "urgent" });
    expect(getDeadlineLabel("2026-01-18")).toEqual({ label: "8d left", tier: "soon" });
    expect(getDeadlineLabel("2026-02-09")).toEqual({ label: "30d left", tier: "soon" });
    expect(getDeadlineLabel("2026-03-01")).toEqual({ label: "Mar 1", tier: "open" });
    expect(getDeadlineLabel(null)).toBeNull();
  });
});
