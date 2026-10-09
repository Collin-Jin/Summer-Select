"use client";

import type { CSSProperties, ReactNode, MouseEvent } from "react";
import { useReveal } from "./hooks";

/** Fades and slides children in once, when they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [ref, visible] = useReveal(0.1, "0px 0px -60px 0px");
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(${y}px) scale(0.97)`,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Updates --mx / --my so `.spotlight` can paint a highlight under the cursor. */
export function trackPointer(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/** Subtle 3D tilt toward the cursor. Resets on leave. */
export function tiltOnMove(e: MouseEvent<HTMLElement>, max = 6) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
}
export function tiltReset(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}

/** Fixed star positions so server and client render the same markup. */
const STARS = [
  [6, 12, 0], [14, 72, 0.8], [22, 30, 1.6], [31, 88, 0.4], [38, 8, 2.1], [47, 55, 1.1],
  [55, 20, 2.6], [63, 80, 0.2], [71, 38, 1.9], [79, 62, 0.9], [86, 14, 2.3], [93, 48, 1.4],
  [10, 46, 2.8], [27, 60, 0.6], [44, 92, 1.7], [58, 6, 0.3], [74, 94, 2.4], [90, 76, 1.0],
] as const;

export function Starfield({ color = "#FFC145" }: { color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {STARS.map(([top, left, delay], i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: i % 3 === 0 ? 4 : 3,
            height: i % 3 === 0 ? 4 : 3,
            background: color,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Pins a thin progress bar to the top of the viewport. */
export function ScrollBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none" aria-hidden>
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "linear-gradient(90deg, #5B5F97, #FFC145, #FF6B6C)",
        }}
      />
    </div>
  );
}
