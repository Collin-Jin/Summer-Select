import { supabaseServer } from "@/utils/supabase/server";
import type { SummerProgram } from "@/lib/database.types";

export type FormatOption = { en: string; zh: string | null };
export type CategoryOption = { en: string; zh: string | null };

/**
 * Fetches all published summer programs from Supabase.
 * Called exclusively from Server Components — uses the cookie-based server client.
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
      console.error("[getProgramBySlug] Supabase error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Fetches a batch of programs by their `lid` primary keys.
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
 * Fetches all unique category values for the filter UI, in both EN and ZH.
 * Returns deduplicated pairs keyed on the English value.
 */
export async function getProgramCategories(): Promise<CategoryOption[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("primary_category_en, primary_category_zh");

  if (error || !data) return [];

  const seen = new Set<string>();
  const result: CategoryOption[] = [];

  for (const row of data) {
    const en = row.primary_category_en;
    if (!en || seen.has(en)) continue;
    seen.add(en);
    result.push({ en, zh: row.primary_category_zh ?? null });
  }

  return result.sort((a, b) => a.en.localeCompare(b.en));
}

/**
 * Fetches all unique format values for the filter UI, in both EN and ZH.
 * Returns deduplicated pairs keyed on the English value.
 */
export async function getProgramFormats(): Promise<FormatOption[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("summer_programs")
    .select("format_en, format_zh");

  if (error || !data) return [];

  const seen = new Set<string>();
  const result: FormatOption[] = [];

  for (const row of data) {
    const en = row.format_en;
    if (!en || seen.has(en)) continue;
    seen.add(en);
    result.push({ en, zh: row.format_zh ?? null });
  }

  return result.sort((a, b) => a.en.localeCompare(b.en));
}
