import type { Metadata } from "next";
import { getAllPrograms, getProgramCategories, getProgramFormats } from "@/lib/programs";
import { ProgramsClientView } from "@/components/programs/ProgramsClientView";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Program Directory",
};

/**
 * Program Directory — Server Component. Public: no sign-in required.
 *
 * Guests and unpaid accounts see everything except Collin's paid analysis
 * (see lib/programs.ts); saving to My List is members-only.
 *
 * Fetches all published programs and available filter metadata in parallel,
 * then delegates all interactivity (search, filter, sort, favorites) to
 * <ProgramsClientView>, a Client Component that manages state client-side.
 *
 * With 50 programs the full-fetch + client-filter approach is far simpler
 * and equally performant compared to server-side pagination.
 */
export default async function DashboardPage() {
  const [programs, categories, formats, viewer] = await Promise.all([
    getAllPrograms(),
    getProgramCategories(),
    getProgramFormats(),
    getViewer(),
  ]);

  return (
    <ProgramsClientView
      programs={programs}
      categories={categories}
      formats={formats}
      access={viewer.access}
    />
  );
}
