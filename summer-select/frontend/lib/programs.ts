import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { getEditing } from "@/lib/admin/editMode";
import type { SummerProgram } from "@/lib/database.types";

export type FormatOption = { en: string; zh: string | null };
export type CategoryOption = { en: string; zh: string | null };

/**
 * Which relation to read programs from, by access tier (the database enforces
 * the split; see the view migrations):
 *  - guests            -> `public_summer_programs`: no analysis text
 *  - registered users  -> `member_summer_programs`: adds Collin's analysis
 *  - paid members      -> `summer_programs`: the base table
 *
 * The admin can read drafts too, but only sees them while Edit mode is on, so
 * the rest of the time the site looks exactly like it does to members.
 */
async function programsSource() {
  const [supabase, viewer, editing] = await Promise.all([
    supabaseServer(),
    getViewer(),
    getEditing(),
  ]);
  const table = viewer.isPaid
    ? "summer_programs"
    : viewer.user
      ? "member_summer_programs"
      : "public_summer_programs";
  return { builder: supabase.from(table), publishedOnly: viewer.isAdmin && !editing };
}

/** Fills the analysis fields with null for guests so every row matches `SummerProgram`. */
function toProgram(row: Record<string, unknown>): SummerProgram {
  return {
    collin_rationale_en: null,
    collin_rationale_zh: null,
    collin_strategy_en: null,
    collin_strategy_zh: null,
    ...row,
  } as SummerProgram;
}

/**
 * Fetches all published summer programs from Supabase.
 * Called exclusively from Server Components — uses the cookie-based server client.
 */
export async function getAllPrograms(): Promise<SummerProgram[]> {
  const { builder, publishedOnly } = await programsSource();
  let query = builder.select("*");
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.order("collin_rec_index", {
    ascending: false,
    nullsFirst: false,
  });

  if (error) {
    console.error("[getAllPrograms] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(toProgram);
}

/**
 * Fetches a single summer program by its URL-friendly slug.
 */
export async function getProgramBySlug(
  slug: string
): Promise<SummerProgram | null> {
  const { builder, publishedOnly } = await programsSource();
  let query = builder.select("*").eq("slug", slug);
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getProgramBySlug] Supabase error:", error.message);
    }
    return null;
  }

  return toProgram(data);
}

/**
 * Fetches a batch of programs by their `lid` primary keys.
 */
export async function getProgramsByIds(
  lids: string[]
): Promise<SummerProgram[]> {
  if (lids.length === 0) return [];

  const { builder, publishedOnly } = await programsSource();
  let query = builder.select("*").in("lid", lids);
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query;

  if (error) {
    console.error("[getProgramsByIds] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(toProgram);
}

/**
 * Fetches all unique category values for the filter UI, in both EN and ZH.
 * Returns deduplicated pairs keyed on the English value.
 */
export async function getProgramCategories(): Promise<CategoryOption[]> {
  const { builder, publishedOnly } = await programsSource();
  let query = builder.select("primary_category_en, primary_category_zh");
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query;

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
  const { builder, publishedOnly } = await programsSource();
  let query = builder.select("format_en, format_zh");
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query;

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
