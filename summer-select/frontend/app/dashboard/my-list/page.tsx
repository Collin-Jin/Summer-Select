import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { getProgramsByIds } from "@/lib/programs";
import { redirect } from "next/navigation";
import { loginUrl } from "@/lib/access";
import { toDateKey } from "@/lib/planner";
import type { SavedEntry } from "@/components/mylist/types";
import { MyListClientView } from "./MyListClientView";

export const metadata: Metadata = {
  title: "My List",
};

/**
 * My List Page — Server Component.
 *
 * Loads the user's saved programs together with their rating, notes and
 * application status, resolves the full program rows, and hands everything to
 * the interactive planner.
 */
export default async function MyListPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy redirects guests first; this is the server-side backstop.
  if (!user) redirect(loginUrl("/dashboard/my-list"));

  const { data: favRows } = await supabase
    .from("favorites")
    .select("program_id, rating, notes, status, created_at")
    .eq("user_id", user.id);

  const rows = favRows ?? [];
  const programs = await getProgramsByIds(rows.map((f) => f.program_id));
  const programById = new Map(programs.map((p) => [p.lid, p]));

  const entries: SavedEntry[] = rows.flatMap((row) => {
    const program = programById.get(row.program_id);
    // A saved program that is no longer available has nothing to show.
    if (!program) return [];
    return [
      {
        program,
        rating: row.rating,
        notes: row.notes ?? "",
        status: row.status,
        createdAt: row.created_at,
      },
    ];
  });

  return <MyListClientView entries={entries} todayKey={toDateKey(new Date())} />;
}
