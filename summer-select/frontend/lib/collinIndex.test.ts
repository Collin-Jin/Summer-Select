import { describe, expect, it } from "vitest";
import { getCollinSelectivityTier } from "./collinIndex";

describe("getCollinSelectivityTier", () => {
  it.each([
    [10, "Tier 1"],
    [8, "Tier 1"],
    [7, "Tier 2"],
    [6, "Tier 2"],
    [5, "Tier 3"],
    [1, "Tier 3"],
  ])("maps %s to %s", (score, tier) => {
    expect(getCollinSelectivityTier(score)).toBe(tier);
  });

  it("localises the tier name", () => {
    expect(getCollinSelectivityTier(9, "zh")).toBe("第一梯队");
  });

  it("returns null when there is no usable score", () => {
    expect(getCollinSelectivityTier(null)).toBeNull();
    expect(getCollinSelectivityTier(undefined)).toBeNull();
    expect(getCollinSelectivityTier(Number.NaN)).toBeNull();
  });
});
