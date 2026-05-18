"use client";

import type { ReactNode } from "react";

/**
 * Wraps children in a div that blocks text selection, copy, cut, and
 * right-click context menus — preventing casual scraping of premium content.
 */
export function ProtectedContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="protected-content"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
