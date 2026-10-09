"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";

interface StarRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
  /** Accessible label for each star, e.g. "Rate 3 out of 5". */
  ariaLabel: (n: number) => string;
  groupLabel: string;
  size?: "sm" | "md";
}

/**
 * Five-star rating. Clicking the current rating clears it. Behaves as a radio
 * group for assistive tech and previews the rating on hover.
 */
export function StarRating({ value, onChange, ariaLabel, groupLabel, size = "md" }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={ariaLabel(n)}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(value === n ? null : n)}
          className="rounded p-0.5 transition-transform duration-100 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
        >
          <Star
            className={clsx(
              "transition-colors duration-100",
              size === "sm" ? "h-4 w-4" : "h-6 w-6",
              n <= shown ? "text-[#FFC145]" : "text-slate-300"
            )}
            fill={n <= shown ? "#FFC145" : "transparent"}
          />
        </button>
      ))}
    </div>
  );
}
