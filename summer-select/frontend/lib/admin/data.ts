import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RESOURCES,
  getResource,
  type ChildDef,
  type Option,
  type ResourceDef,
  type Values,
} from "./resources";

export const PAGE_SIZE = 25;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INT_RE = /^\d{1,15}$/;

/** True when `id` has the right shape for the resource's primary key. */
export function isValidId(resource: ResourceDef, id: string): boolean {
  return resource.key === "documents" ? INT_RE.test(id) : UUID_RE.test(id);
}

function selectList(columns: string[]): string {
  return columns.join(",");
}

/** Strips characters that have special meaning inside a PostgREST `or()` filter. */
function cleanSearch(q: string): string {
  return q.replace(/[,()%*_\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export interface ListResult {
  rows: Values[];
  total: number;
  page: number;
  pageCount: number;
}

export async function listRecords(
  supabase: SupabaseClient,
  resource: ResourceDef,
  opts: { q?: string; page?: number; status?: "published" | "draft" | "all" }
): Promise<ListResult> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;

  const columns = resource.listSelect ?? [resource.pk, ...resource.columns.map((c) => c.key)];
  let query = supabase
    .from(resource.table)
    .select(selectList(columns), { count: "exact" });

  const q = cleanSearch(opts.q ?? "");
  if (q && resource.searchColumns.length) {
    query = query.or(resource.searchColumns.map((c) => `${c}.ilike.%${q}%`).join(","));
  }
  if (resource.hasPublished && opts.status === "published") query = query.eq("is_published", true);
  if (resource.hasPublished && opts.status === "draft") query = query.eq("is_published", false);

  for (const o of resource.order) query = query.order(o.column, { ascending: o.ascending });
  // Stable tie-breaker so pagination never repeats or skips rows.
  if (!resource.order.some((o) => o.column === resource.pk)) {
    query = query.order(resource.pk, { ascending: true });
  }

  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(`Could not load ${resource.label.toLowerCase()}: ${error.message}`);

  const total = count ?? 0;
  const rows = ((data ?? []) as unknown as Values[]).map((r) =>
    resource.fromRow ? resource.fromRow(r) : r
  );
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Raw database row (not passed through `fromRow`). */
export async function getRawRecord(
  supabase: SupabaseClient,
  resource: ResourceDef,
  id: string
): Promise<Values | null> {
  if (!isValidId(resource, id)) return null;
  const { data, error } = await supabase
    .from(resource.table)
    // Skip the (large) embedding vector; it is rebuilt on save when the text changes.
    .select(resource.key === "documents" ? "id,content,metadata" : "*")
    .eq(resource.pk, id)
    .maybeSingle();
  if (error) throw new Error(`Could not load ${resource.singular}: ${error.message}`);
  return (data as Values | null) ?? null;
}

/** Row converted to the flat shape the form works with. */
export async function getRecord(
  supabase: SupabaseClient,
  resource: ResourceDef,
  id: string
): Promise<Values | null> {
  const row = await getRawRecord(supabase, resource, id);
  if (!row) return null;
  return resource.fromRow ? resource.fromRow(row) : row;
}

function optionLabel(resource: ResourceDef, row: Values): string {
  const title = resource.title(row);
  if (resource.key === "programs") return `${title} (${String(row.slug)})`;
  if (resource.key === "prompts") return `${String(row.program_slug)} — ${title}`;
  return title;
}

/** Choices for every `select` field that points at another resource. */
export async function getRefOptions(
  supabase: SupabaseClient,
  resource: ResourceDef
): Promise<Record<string, Option[]>> {
  const result: Record<string, Option[]> = {};

  await Promise.all(
    resource.fields
      .filter((f) => f.type === "select" && f.refResource)
      .map(async (field) => {
        const target = getResource(field.refResource!);
        if (!target) return;
        const valueColumn = target.refValue ?? target.pk;
        const columns = Array.from(new Set([target.pk, valueColumn, ...target.labelColumns]));
        let query = supabase.from(target.table).select(selectList(columns));
        for (const o of target.order) query = query.order(o.column, { ascending: o.ascending });
        const { data, error } = await query.limit(2000);
        if (error) throw new Error(`Could not load ${target.label.toLowerCase()}: ${error.message}`);
        result[field.name] = ((data ?? []) as unknown as Values[]).map((row) => ({
          value: String(row[valueColumn]),
          label: optionLabel(target, row),
        }));
      })
  );

  return result;
}

/** Existing values for `suggest` fields, so spelling stays consistent. */
export async function getSuggestions(
  supabase: SupabaseClient,
  resource: ResourceDef
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};

  await Promise.all(
    resource.fields
      .filter((f) => f.suggest)
      .map(async (field) => {
        const sources: { table: string; column: string }[] = [
          { table: resource.table, column: field.name },
        ];
        if (field.suggestFrom) {
          const other = getResource(field.suggestFrom.resource);
          if (other) sources.push({ table: other.table, column: field.suggestFrom.column });
        }

        const found = new Set<string>();
        for (const src of sources) {
          const { data } = await supabase.from(src.table).select(src.column).limit(2000);
          for (const row of (data ?? []) as unknown as Values[]) {
            const v = row[src.column];
            if (typeof v === "string" && v.trim()) found.add(v.trim());
          }
        }
        result[field.name] = Array.from(found).sort((a, b) => a.localeCompare(b));
      })
  );

  return result;
}

export interface ChildRows {
  child: ChildDef;
  resource: ResourceDef;
  rows: Values[];
}

/** Records that belong to `parentRow` (e.g. the prompts of a program). */
export async function getChildRows(
  supabase: SupabaseClient,
  parent: ResourceDef,
  parentRow: Values,
  child: ChildDef
): Promise<ChildRows> {
  const resource = RESOURCES[child.resource];
  const parentValue = parentRow[child.parentColumn ?? parent.pk];
  let rows: Values[] = [];

  if (parentValue !== undefined && parentValue !== null) {
    const columns = resource.listSelect ?? [resource.pk];
    let query = supabase
      .from(resource.table)
      .select(selectList(columns))
      .eq(child.field, parentValue as string);
    for (const o of resource.order) query = query.order(o.column, { ascending: o.ascending });
    const { data, error } = await query.limit(500);
    if (error) throw new Error(`Could not load ${resource.label.toLowerCase()}: ${error.message}`);
    rows = (data ?? []) as unknown as Values[];
  }

  return { child, resource, rows };
}

/** Number of records that would be deleted along with `row` (cascade). */
export async function getCascadeCounts(
  supabase: SupabaseClient,
  resource: ResourceDef,
  row: Values
): Promise<{ label: string; count: number }[]> {
  const out: { label: string; count: number }[] = [];

  async function count(table: string, column: string, value: unknown): Promise<number> {
    const { count: n } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(column, value as string);
    return n ?? 0;
  }

  if (resource.key === "programs") {
    const slug = row.slug as string;
    const { data: prompts } = await supabase
      .from("summer_program_prompts")
      .select("id")
      .eq("program_slug", slug);
    const ids = (prompts ?? []).map((p: Values) => p.id as string);
    out.push({ label: "essay prompts", count: ids.length });
    if (ids.length) {
      const { count: n } = await supabase
        .from("program_example_essays")
        .select("*", { count: "exact", head: true })
        .in("prompt_id", ids);
      out.push({ label: "example essays", count: n ?? 0 });
    }
  } else if (resource.key === "prompts") {
    out.push({ label: "example essays", count: await count("program_example_essays", "prompt_id", row.id) });
  } else if (resource.key === "guides") {
    out.push({ label: "interview questions", count: await count("interview_questions", "guide_id", row.id) });
  }

  return out.filter((c) => c.count > 0);
}

export interface ResourceCount {
  total: number;
  published: number | null;
}

export async function getResourceCounts(
  supabase: SupabaseClient
): Promise<Record<string, ResourceCount>> {
  const entries = await Promise.all(
    Object.values(RESOURCES).map(async (r) => {
      const total = await supabase.from(r.table).select("*", { count: "exact", head: true });
      let published: number | null = null;
      if (r.hasPublished) {
        const pub = await supabase
          .from(r.table)
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);
        published = pub.count ?? 0;
      }
      return [r.key, { total: total.count ?? 0, published }] as const;
    })
  );
  return Object.fromEntries(entries);
}

/** URL of the parent's edit page for a child row, or the child's list as a fallback. */
export async function parentHref(
  supabase: SupabaseClient,
  resource: ResourceDef,
  row: Values
): Promise<string> {
  const fallback = `/admin/${resource.key}`;
  if (!resource.parent) return fallback;
  const parent = getResource(resource.parent.resource);
  const link = row[resource.parent.field];
  if (!parent || typeof link !== "string") return fallback;

  const column = parent.refValue ?? parent.pk;
  const { data } = await supabase
    .from(parent.table)
    .select(parent.pk)
    .eq(column, link)
    .maybeSingle();
  const pk = (data as Values | null)?.[parent.pk];
  return typeof pk === "string" || typeof pk === "number"
    ? `/admin/${parent.key}/${pk}`
    : fallback;
}

/** How many sign-ins were turned away by the one-device rule in the last 7 days. */
export async function countRecentBlockedSignIns(supabase: SupabaseClient): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("blocked_sign_ins")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  return count ?? 0;
}
