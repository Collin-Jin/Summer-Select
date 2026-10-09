"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseDate, toDateKey } from "@/lib/planner";

function subscribe(onChange: () => void) {
  // Re-check once a minute so the page rolls over at midnight.
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/**
 * Today's calendar date in the visitor's time zone.
 *
 * The server renders with its own clock (`serverKey`) so hydration matches;
 * the browser then switches to the local date if it differs.
 */
export function useToday(serverKey: string): Date {
  const key = useSyncExternalStore(
    subscribe,
    () => toDateKey(new Date()),
    () => serverKey
  );
  return useMemo(() => parseDate(key) as Date, [key]);
}
