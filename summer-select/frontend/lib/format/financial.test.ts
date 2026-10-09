import { describe, expect, it } from "vitest";
import {
  formatAcceptanceRate,
  formatAppFee,
  formatCost,
  formatEligibleGrades,
  formatGpa,
  formatStipend,
} from "./financial";

describe("formatCost", () => {
  it("formats dollars without cents", () => {
    expect(formatCost(3500)).toBe("$3,500");
  });
  it("treats zero as free and null as unknown", () => {
    expect(formatCost(0)).toBe("Free");
    expect(formatCost(null)).toBe("—");
    expect(formatCost(undefined)).toBe("—");
  });
});

describe("formatAppFee", () => {
  it.each([
    [75, "$75 application fee"],
    [0, "Free to apply"],
    [null, "—"],
  ])("formats %s", (fee, expected) => expect(formatAppFee(fee)).toBe(expected));
});

describe("formatStipend", () => {
  it("covers the unpaid, unknown-amount and known-amount cases", () => {
    expect(formatStipend(false, 2000)).toBe("None");
    expect(formatStipend(null, null)).toBe("None");
    expect(formatStipend(true, null)).toBe("Stipend (amount TBD)");
    expect(formatStipend(true, 2000)).toBe("$2,000 stipend");
  });
});

describe("formatAcceptanceRate", () => {
  it("accepts both fractions and percentages", () => {
    expect(formatAcceptanceRate(0.08)).toBe("~8%");
    expect(formatAcceptanceRate(8)).toBe("~8%");
    expect(formatAcceptanceRate(45)).toBe("~45%");
    expect(formatAcceptanceRate(null)).toBe("—");
  });
});

describe("formatGpa", () => {
  it("shows one decimal place or no minimum", () => {
    expect(formatGpa(3.5)).toBe("3.5 GPA minimum");
    expect(formatGpa(3)).toBe("3.0 GPA minimum");
    expect(formatGpa(null)).toBe("No minimum");
  });
});

describe("formatEligibleGrades", () => {
  it("summarises contiguous ranges and lists gaps", () => {
    expect(formatEligibleGrades([12, 10, 11])).toBe("Grades 10–12");
    expect(formatEligibleGrades([9, 11])).toBe("Grades 9, 11");
    expect(formatEligibleGrades([11])).toBe("Grade 11");
  });
  it("means all grades when none are listed", () => {
    expect(formatEligibleGrades([])).toBe("All grades");
    expect(formatEligibleGrades(null)).toBe("All grades");
  });
});
