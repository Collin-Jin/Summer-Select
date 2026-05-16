import { supabaseServer } from "@/utils/supabase/server";
import type { SummerProgram } from "@/lib/database.types";

/**
 * Fetches all published summer programs from Supabase.
 * Called exclusively from Server Components — uses the cookie-based server client.
 *
 * RLS automatically restricts rows to `is_published = true` and paid users.
 *
 * @returns Array of SummerProgram rows, or an empty array on error.
 */
export async function getAllPrograms(): Promise<SummerProgram[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("*")
    .order("collin_rec_index", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[getAllPrograms] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetches a single summer program by its URL-friendly slug.
 * Called exclusively from Server Components.
 *
 * @param slug - The program's unique slug, e.g. "ucsb-rmp"
 * @returns The matching SummerProgram row, or null if not found.
 */
export async function getProgramBySlug(
  slug: string
): Promise<SummerProgram | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = no rows found — that's expected for invalid slugs
      console.error("[getProgramBySlug] Supabase error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Fetches a batch of programs by their `lid` primary keys.
 * Used by the My List page to load favorited programs.
 *
 * @param lids - Array of program UUIDs
 * @returns Array of matching SummerProgram rows.
 */
export async function getProgramsByIds(
  lids: string[]
): Promise<SummerProgram[]> {
  if (lids.length === 0) return [];

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("*")
    .in("lid", lids);

  if (error) {
    console.error("[getProgramsByIds] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetches all unique `primary_category_en` values for filter UI population.
 * Returns a deduplicated, sorted array.
 */
export async function getProgramCategories(): Promise<string[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("primary_category_en");

  if (error || !data) return [];

  return [
    ...new Set(
      data
        .map((r) => r.primary_category_en)
        .filter((c): c is string => Boolean(c))
    ),
  ].sort();
}

/**
 * Fetches all unique `format_en` values for filter UI population.
 */
export async function getProgramFormats(): Promise<string[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("format_en");

  if (error || !data) return [];

  return [
    ...new Set(
      data.map((r) => r.format_en).filter((f): f is string => Boolean(f))
    ),
  ].sort();
}
