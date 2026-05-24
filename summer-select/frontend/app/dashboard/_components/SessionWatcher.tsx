"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible client component mounted inside the dashboard layout.
 * Calls router.refresh() on a fixed interval, which re-runs the server
 * layout and triggers the ss_sid vs profiles.active_session_id check.
 * This ensures a logged-in user is kicked out within `intervalMs` even
 * if they are idle and haven't navigated to a new page.
 */
export function SessionWatcher({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
