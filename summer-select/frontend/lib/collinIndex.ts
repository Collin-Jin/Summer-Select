/**
 * Selectivity tier derived from Collin Index (replaces DB difficulty_level).
 *   8–10 → Tier 1 / 第一梯队
 *   6–7  → Tier 2 / 第二梯队
 *   1–5  → Tier 3 / 第三梯队
 */
export function getCollinSelectivityTier(
  score: number | null | undefined,
  lang: "en" | "zh" = "en"
): string | null {
  if (score === null || score === undefined) return null;
  const n = Number(score);
  if (Number.isNaN(n)) return null;
  if (n >= 8) return lang === "zh" ? "第一梯队" : "Tier 1";
  if (n >= 6) return lang === "zh" ? "第二梯队" : "Tier 2";
  return lang === "zh" ? "第三梯队" : "Tier 3";
}
