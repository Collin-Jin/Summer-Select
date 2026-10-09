import type { FavoriteStatus, SummerProgram } from "@/lib/database.types";

/** A saved program together with the user's private planner data. */
export interface SavedEntry {
  program: SummerProgram;
  rating: number | null;
  notes: string;
  status: FavoriteStatus;
  createdAt: string | null;
}

import type { PlannerEvent } from "@/lib/planner";

/** A dated event resolved against its program and today's date. */
export interface DeadlineItem {
  event: PlannerEvent;
  entry: SavedEntry;
  /** Calendar days from today (negative once passed). */
  days: number;
}
