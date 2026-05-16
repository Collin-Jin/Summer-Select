"use client";

import { clsx } from "clsx";

interface CollinIndexBadgeProps {
  /** Score from 1–10. Null renders a neutral placeholder. */
  score: number | null | undefined;
  /** 'compact' for cards, 'full' for the detail page gauge */
  variant?: "compact" | "full";
}

/**
 * Displays Collin's proprietary recommendation index score (1–10).
 *
 * - compact: a small pill badge used on ProgramCard and list views
 * - full: a large circular gauge used on ProgramDetailPage
 *
 * Color tiers:
 *   8–10 → Emerald  (Highly Recommended)
 *   6–7  → Blue     (Recommended)
 *   4–5  → Amber    (Consider Carefully)
 *   1–3  → Rose     (Not Recommended)
 */
export function CollinIndexBadge({
  score,
  variant = "compact",
}: CollinIndexBadgeProps) {
  if (score === null || score === undefined) {
    return variant === "compact" ? (
      <span className="text-xs text-slate-400 font-medium">No rating</span>
    ) : null;
  }

  const tier =
    score >= 8
      ? { color: "emerald", label: "Highly Recommended" }
      : score >= 6
      ? { color: "blue", label: "Recommended" }
      : score >= 4
      ? { color: "amber", label: "Consider Carefully" }
      : { color: "rose", label: "Not Recommended" };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <span
          className={clsx(
            "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
            tier.color === "emerald" && "bg-emerald-100 text-emerald-700",
            tier.color === "blue" && "bg-blue-100 text-blue-700",
            tier.color === "amber" && "bg-amber-100 text-amber-700",
            tier.color === "rose" && "bg-rose-100 text-rose-700"
          )}
        >
          {score}
        </span>
        <span className="text-xs text-slate-500 font-medium">CI</span>
      </div>
    );
  }

  // Full gauge variant for the detail page
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 10) * circumference;

  const strokeColor: Record<string, string> = {
    emerald: "#10b981",
    blue: "#3b82f6",
    amber: "#f59e0b",
    rose: "#f43f5e",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width="112"
          height="112"
          viewBox="0 0 100 100"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor[tier.color]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score label */}
        <div className="absolute flex flex-col items-center">
          <span
            className={clsx(
              "text-3xl font-bold",
              tier.color === "emerald" && "text-emerald-600",
              tier.color === "blue" && "text-blue-600",
              tier.color === "amber" && "text-amber-600",
              tier.color === "rose" && "text-rose-600"
            )}
          >
            {score}
          </span>
          <span className="text-xs text-slate-400 font-medium">/10</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Collin Index
        </p>
        <p
          className={clsx(
            "text-sm font-semibold mt-0.5",
            tier.color === "emerald" && "text-emerald-600",
            tier.color === "blue" && "text-blue-600",
            tier.color === "amber" && "text-amber-600",
            tier.color === "rose" && "text-rose-600"
          )}
        >
          {tier.label}
        </p>
      </div>
    </div>
  );
}
