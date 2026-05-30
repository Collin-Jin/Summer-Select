"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { ProtectedContent } from "./ProtectedContent";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface WatermarkedContentProps {
  userEmail: string | null | undefined;
  children: ReactNode;
  /** Second line on the watermark tile. */
  brandLabel?: string;
}

/**
 * Copy-protected content with a tiled diagonal watermark (email + brand).
 * Overlay is readable on screenshots but kept light enough for daily reading.
 */
export function WatermarkedContent({
  userEmail,
  children,
  brandLabel = "collin学长",
}: WatermarkedContentProps) {
  const tileUrl = useMemo(() => {
    const emailLine = escapeXml(userEmail?.trim() || "Summer Select");
    const brandLine = escapeXml(brandLabel);
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>` +
      `<text x='160' y='88' fill='rgba(91,95,151,0.13)' font-size='12' font-weight='500' font-family='system-ui,-apple-system,sans-serif' text-anchor='middle' transform='rotate(-24 160 100)'>${emailLine}</text>` +
      `<text x='160' y='108' fill='rgba(91,95,151,0.10)' font-size='11' font-weight='600' font-family='system-ui,-apple-system,sans-serif' text-anchor='middle' transform='rotate(-24 160 100)'>${brandLine}</text>` +
      `</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [userEmail, brandLabel]);

  return (
    <div className="relative">
      <ProtectedContent>{children}</ProtectedContent>
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: tileUrl,
          backgroundRepeat: "repeat",
          backgroundSize: "320px 200px",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
