import type { Metadata } from "next";
import { getAllPrograms, getProgramCategories, getProgramFormats } from "@/lib/programs";
import { ProgramsClientView } from "@/components/programs/ProgramsClientView";

export const metadata: Metadata = {
  title: "Program Directory",
};

/**
 * Main Dashboard — Server Component.
 *
 * Fetches all published programs and available filter metadata in parallel,
 * then delegates all interactivity (search, filter, sort, favorites) to
 * <ProgramsClientView>, a Client Component that manages state client-side.
 *
 * With 50 programs the full-fetch + client-filter approach is far simpler
 * and equally performant compared to server-side pagination.
 */
export default async function DashboardPage() {
  const [programs, categories, formats] = await Promise.all([
    getAllPrograms(),
    getProgramCategories(),
    getProgramFormats(),
  ]);

  return (
    <ProgramsClientView
      programs={programs}
      categories={categories}
      formats={formats}
    />
  );
}
