"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { getAdminContext } from "@/lib/admin/auth";
import { loadArrangeGroups } from "@/lib/admin/arrange";
import { isArrangeKind } from "@/lib/admin/arrangeTypes";
import {
  getCascadeCounts,
  getRawRecord,
  getRefOptions,
  getSuggestions,
  isValidId,
  parentHref,
} from "@/lib/admin/data";
import { EDIT_COOKIE } from "@/lib/admin/editMode";
import {
  getResource,
  initialFormValues,
  toFormSpec,
  type FieldValue,
  type FormSpec,
  type Option,
  type ResourceDef,
  type Values,
} from "@/lib/admin/resources";
import { parseForm, type FieldErrors } from "@/lib/admin/validate";

export type ActionResult =
  | { ok: true; id?: string; message: string; redirectTo?: string }
  | { ok: false; error?: string; fieldErrors?: FieldErrors };

const NOT_ADMIN: ActionResult = {
  ok: false,
  error: "You need to be signed in as the site admin to do that.",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DbError {
  code?: string;
  message: string;
  details?: string | null;
}

function mapDbError(error: DbError, resource: ResourceDef): ActionResult {
  switch (error.code) {
    case "23505": {
      const slugField = resource.fields.find((f) => f.slug && f.name === "slug");
      if (slugField) {
        return { ok: false, fieldErrors: { slug: "That URL slug is already used by another record." } };
      }
      return { ok: false, error: "A record with the same unique value already exists." };
    }
    case "23503":
      return {
        ok: false,
        error: "This record is linked to another record. Check that the linked item still exists, or remove the items that depend on it first.",
      };
    case "23502": {
      const column = /column "([^"]+)"/.exec(error.message)?.[1];
      return column && resource.fields.some((f) => f.name === column)
        ? { ok: false, fieldErrors: { [column]: "This field is required." } }
        : { ok: false, error: error.message };
    }
    case "23514":
      return { ok: false, error: "One of the values is outside the range the database allows. Please review the numbers." };
    case "22P02":
    case "22007":
    case "22003":
      return { ok: false, error: "One of the values has an invalid format. Please review the form." };
    case "42501":
      return NOT_ADMIN;
    default:
      return { ok: false, error: error.message || "Something went wrong. Please try again." };
  }
}

function revalidateSite() {
  // Every public page reads this content, so refresh the whole site's cache.
  revalidatePath("/", "layout");
}

async function embed(text: string): Promise<{ vector: number[] } | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not set on the server, so the AI search index can't be updated." };
  }
  try {
    const openai = new OpenAI({ apiKey });
    const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
    return { vector: res.data[0].embedding };
  } catch (err) {
    console.error("Embedding failed:", err);
    return { error: "OpenAI could not index this essay right now. Nothing was saved — please try again." };
  }
}

type Supabase = NonNullable<Awaited<ReturnType<typeof getAdminContext>>>["supabase"];

/** Order columns that put a brand-new record last in its list. */
async function appendPosition(
  supabase: Supabase,
  resourceKey: string,
  row: Values
): Promise<Values | null> {
  if (resourceKey === "prompts") {
    const { data } = await supabase
      .from("summer_program_prompts")
      .select("program_order, order")
      .eq("program_slug", row.program_slug as string)
      .order("program_order", { ascending: false })
      .order("order", { ascending: false })
      .limit(1);
    const last = data?.[0] as { program_order: number; order: number } | undefined;
    if (last) return { program_order: last.program_order, order: last.order + 1 };

    // First prompt of a program: the program goes to the end of the Essays page.
    const { data: top } = await supabase
      .from("summer_program_prompts")
      .select("program_order")
      .order("program_order", { ascending: false })
      .limit(1);
    const max = (top?.[0] as { program_order: number } | undefined)?.program_order;
    return { program_order: max === undefined ? 0 : max + 1, order: 0 };
  }

  if (resourceKey === "guides") {
    const { data } = await supabase
      .from("interview_guides")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const max = (data?.[0] as { sort_order: number | null } | undefined)?.sort_order;
    return { sort_order: (max ?? -1) + 1 };
  }

  if (resourceKey === "questions") {
    const { data } = await supabase
      .from("interview_questions")
      .select("sort_order")
      .eq("guide_id", row.guide_id as string)
      .order("sort_order", { ascending: false })
      .limit(1);
    const max = (data?.[0] as { sort_order: number | null } | undefined)?.sort_order;
    return { sort_order: (max ?? -1) + 1 };
  }

  return null;
}

/** Creates or updates one record. `id` is null when creating. */
export async function saveRecord(
  resourceKey: string,
  id: string | null,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  const { supabase } = ctx;

  const resource = getResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };

  const mode = id ? "update" : "create";
  if (id && !isValidId(resource, id)) return { ok: false, error: "Invalid record." };

  const { values, errors } = parseForm(resource, formData, mode);
  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  let existing: Values | null = null;
  if (id) {
    existing = await getRawRecord(supabase, resource, id);
    if (!existing) return { ok: false, error: "This record no longer exists. It may have been deleted." };
  }

  const row: Values = resource.toRow ? resource.toRow(values) : { ...values };

  // ── Derived / dependent columns ────────────────────────────────────────────
  if (resource.key === "essays") {
    const promptId = (values.prompt_id as string | undefined) ?? (existing?.prompt_id as string | undefined);
    if (!promptId || !UUID_RE.test(promptId)) {
      return { ok: false, fieldErrors: { prompt_id: "Please choose an essay prompt." } };
    }
    const { data: prompt, error } = await supabase
      .from("summer_program_prompts")
      .select("program_slug")
      .eq("id", promptId)
      .maybeSingle();
    if (error) return mapDbError(error, resource);
    if (!prompt) return { ok: false, fieldErrors: { prompt_id: "That prompt no longer exists." } };
    row.program_slug = prompt.program_slug;

    if (!row.program_name) {
      const { data: program } = await supabase
        .from("summer_programs")
        .select("name_en")
        .eq("slug", prompt.program_slug as string)
        .maybeSingle();
      row.program_name = (program?.name_en as string | undefined) ?? prompt.program_slug;
    }
    if (row.outcome === null) row.outcome = "Accepted";
  }

  if (resource.key === "documents") {
    const content = row.content as string;
    const unchanged = existing && String(existing.content ?? "").trim() === content;
    if (!unchanged) {
      const result = await embed(content);
      if ("error" in result) return { ok: false, error: result.error };
      row.embedding = result.vector;
    }
  }

  // New prompts, guides and questions go to the end of their list; the
  // drag-and-drop "Arrange" screens are the way to move them afterwards.
  if (mode === "create") {
    const placed = await appendPosition(supabase, resource.key, row);
    if (placed) Object.assign(row, placed);
  }

  if (resource.hasUpdatedAt) row.updated_at = new Date().toISOString();

  // ── Write ──────────────────────────────────────────────────────────────────
  let savedId: string | undefined;
  if (id) {
    const { data, error } = await supabase
      .from(resource.table)
      .update(row)
      .eq(resource.pk, id)
      .select(resource.pk);
    if (error) return mapDbError(error, resource);
    if (!data || data.length === 0) {
      return { ok: false, error: "Nothing was saved. The record may have been deleted, or your admin session expired." };
    }
    savedId = id;
  } else {
    const { data, error } = await supabase
      .from(resource.table)
      .insert(row)
      .select(resource.pk)
      .single();
    if (error) return mapDbError(error, resource);
    savedId = String((data as unknown as Values)[resource.pk]);
  }

  revalidateSite();

  // ── Where to go next ───────────────────────────────────────────────────────
  const saved = existing ? { ...existing, ...row } : { ...row, [resource.pk]: savedId };
  let redirectTo: string | undefined;
  if (resource.parent) {
    redirectTo = await parentHref(supabase, resource, saved);
  } else if (mode === "create") {
    redirectTo = resource.children?.length ? `/admin/${resource.key}/${savedId}` : `/admin/${resource.key}`;
  }

  return {
    ok: true,
    id: savedId,
    redirectTo,
    message: mode === "create" ? `Created ${resource.singular}.` : "Changes saved.",
  };
}

/** Deletes a record (and, via the database, everything that depends on it). */
export async function deleteRecord(resourceKey: string, id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  const { supabase } = ctx;

  const resource = getResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };
  if (!isValidId(resource, id)) return { ok: false, error: "Invalid record." };

  const existing = await getRawRecord(supabase, resource, id);
  if (!existing) return { ok: false, error: "This record was already deleted." };

  const { data, error } = await supabase.from(resource.table).delete().eq(resource.pk, id).select(resource.pk);
  if (error) return mapDbError(error, resource);
  if (!data || data.length === 0) {
    return { ok: false, error: "Nothing was deleted. Your admin session may have expired." };
  }

  revalidateSite();

  const redirectTo = resource.parent
    ? await parentHref(supabase, resource, existing)
    : `/admin/${resource.key}`;
  return { ok: true, redirectTo, message: `Deleted ${resource.singular}.` };
}

/** Quick publish / unpublish toggle used in lists. */
export async function setPublished(
  resourceKey: string,
  id: string,
  published: boolean
): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;

  const resource = getResource(resourceKey);
  if (!resource || !resource.hasPublished) return { ok: false, error: "This section can't be published." };
  if (!isValidId(resource, id)) return { ok: false, error: "Invalid record." };

  const patch: Values = { is_published: published === true };
  if (resource.hasUpdatedAt) patch.updated_at = new Date().toISOString();

  const { data, error } = await ctx.supabase
    .from(resource.table)
    .update(patch)
    .eq(resource.pk, id)
    .select(resource.pk);
  if (error) return mapDbError(error, resource);
  if (!data || data.length === 0) return { ok: false, error: "Record not found." };

  revalidateSite();
  return { ok: true, message: published ? "Published." : "Moved to drafts." };
}

export interface UserAccessInput {
  userId: string;
  isPaid: boolean;
  enforceDeviceLock: boolean;
  notes: string;
  resetSession: boolean;
}

/** Changes a member's payment status, device lock and private notes. */
export async function updateUserAccess(input: UserAccessInput): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;

  if (!UUID_RE.test(input.userId)) return { ok: false, error: "Invalid user." };
  const notes = (input.notes ?? "").replace(/\r\n/g, "\n").trim();
  if (notes.length > 2000) return { ok: false, error: "Notes are too long (maximum 2,000 characters)." };

  const { error } = await ctx.supabase.rpc("admin_update_user", {
    p_user_id: input.userId,
    p_is_paid: input.isPaid === true,
    p_enforce_device_lock: input.enforceDeviceLock === true,
    p_notes: notes || null,
    p_reset_session: input.resetSession === true,
  });
  if (error) {
    if (error.code === "P0002") return { ok: false, error: "That user no longer exists." };
    if (error.code === "42501") return NOT_ADMIN;
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "Member updated." };
}

/** Permanently deletes a member's account and everything stored under it. */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  if (!UUID_RE.test(userId)) return { ok: false, error: "Invalid user." };
  if (userId === ctx.user.id) return { ok: false, error: "You can't delete your own account." };

  const { error } = await ctx.supabase.rpc("admin_delete_user", { p_user_id: userId });
  if (error) {
    if (error.code === "P0002") return { ok: false, error: "That user no longer exists." };
    if (error.code === "42501" && error.message === "Not authorized") return NOT_ADMIN;
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin", "layout");
  return { ok: true, message: "Member deleted." };
}

/** Clears a member's blocked sign-in history (for example after sorting out their device). */
export async function clearBlockedSignIns(userId: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  if (!UUID_RE.test(userId)) return { ok: false, error: "Invalid user." };

  const { error } = await ctx.supabase.from("blocked_sign_ins").delete().eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true, message: "History cleared." };
}

/** Marks a problem report as resolved, or reopens it. */
export async function setReportStatus(id: string, status: "open" | "resolved"): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid report." };
  if (status !== "open" && status !== "resolved") return { ok: false, error: "Invalid status." };

  const { data, error } = await ctx.supabase
    .from("error_reports")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: "That report no longer exists." };

  revalidatePath("/admin", "layout");
  return { ok: true, message: status === "resolved" ? "Marked as resolved." : "Reopened." };
}

/** Permanently removes a problem report (for example spam). */
export async function deleteReport(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid report." };

  const { error } = await ctx.supabase.from("error_reports").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true, message: "Report deleted." };
}

export interface ArrangementInput {
  id: string;
  itemIds: string[];
}

const STALE_MESSAGE =
  "The list changed since you opened this page (something was added, removed or moved). Reload the page and arrange again.";

/**
 * Saves a drag-and-drop arrangement: the order of the groups, and the order
 * of the items inside each group. Positions are written as 0..n-1, so there are
 * never gaps or duplicates, and the whole change is applied atomically.
 */
export async function saveArrangement(
  kind: string,
  groups: ArrangementInput[]
): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  if (!isArrangeKind(kind)) return { ok: false, error: "Unknown list." };

  const valid =
    Array.isArray(groups) &&
    groups.length <= 1000 &&
    groups.every(
      (g) =>
        g &&
        typeof g.id === "string" &&
        Array.isArray(g.itemIds) &&
        g.itemIds.length <= 2000 &&
        g.itemIds.every((i) => typeof i === "string")
    );
  if (!valid) return { ok: false, error: "Invalid order." };

  // Compare against the database so a stale page can never overwrite newer data.
  const current = await loadArrangeGroups(ctx.supabase, kind);
  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && new Set(a).size === a.length && a.every((x) => b.includes(x));

  if (!sameSet(groups.map((g) => g.id), current.map((g) => g.id))) {
    return { ok: false, error: STALE_MESSAGE };
  }
  for (const g of groups) {
    const existing = current.find((c) => c.id === g.id);
    if (!existing || !sameSet(g.itemIds, existing.items.map((i) => i.id))) {
      return { ok: false, error: STALE_MESSAGE };
    }
  }

  if (kind === "essays") {
    const items = groups.flatMap((g, gi) =>
      g.itemIds.map((id, ii) => ({ id, program_order: gi, order: ii }))
    );
    const { error } = await ctx.supabase.rpc("admin_reorder_prompts", { p_items: items });
    if (error) return error.code === "42501" ? NOT_ADMIN : { ok: false, error: error.message };
  } else {
    const guides = groups.map((g, gi) => ({ id: g.id, sort_order: gi }));
    const questions = groups.flatMap((g) => g.itemIds.map((id, ii) => ({ id, sort_order: ii })));
    const { error } = await ctx.supabase.rpc("admin_reorder_interviews", {
      p_guides: guides,
      p_questions: questions,
    });
    if (error) return error.code === "42501" ? NOT_ADMIN : { ok: false, error: error.message };
  }

  revalidateSite();
  return { ok: true, message: "Order saved. The website is updated." };
}

/** Turns "Edit mode" on or off for the signed-in admin. */
export async function setEditMode(on: boolean): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return NOT_ADMIN;
  const store = await cookies();
  if (on) {
    store.set(EDIT_COOKIE, "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    store.delete(EDIT_COOKIE);
  }
  return { ok: true, message: on ? "Edit mode on." : "Edit mode off." };
}

export type EditorData =
  | {
      ok: true;
      spec: FormSpec;
      id: string | null;
      title: string;
      initialValues: Record<string, FieldValue>;
      refOptions: Record<string, Option[]>;
      suggestions: Record<string, string[]>;
      cascade: { label: string; count: number }[];
    }
  | { ok: false; error: string };

/**
 * Everything the in-page editor needs to show a form for one record (or an
 * empty one, with optional pre-filled values such as the parent program).
 */
export async function loadEditor(
  resourceKey: string,
  id: string | null,
  presets: Record<string, string> = {}
): Promise<EditorData> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "You need to be signed in as the site admin to do that." };
  const { supabase } = ctx;

  const resource = getResource(resourceKey);
  if (!resource) return { ok: false, error: "Unknown section." };

  try {
    let row: Values | null = null;
    let raw: Values | null = null;
    if (id) {
      if (!isValidId(resource, id)) return { ok: false, error: "Invalid record." };
      raw = await getRawRecord(supabase, resource, id);
      if (!raw) return { ok: false, error: "This record no longer exists. It may have been deleted." };
      row = resource.fromRow ? resource.fromRow(raw) : raw;
    }

    const safePresets: Record<string, string> = {};
    if (!id && presets && typeof presets === "object") {
      for (const f of resource.fields) {
        const v = presets[f.name];
        if (typeof v === "string" && v.length <= 200) safePresets[f.name] = v;
      }
    }

    const [refOptions, suggestions, cascade] = await Promise.all([
      getRefOptions(supabase, resource),
      getSuggestions(supabase, resource),
      raw ? getCascadeCounts(supabase, resource, raw) : Promise.resolve([]),
    ]);

    return {
      ok: true,
      spec: toFormSpec(resource),
      id,
      title: row ? resource.title(row) : `New ${resource.singular}`,
      initialValues: initialFormValues(resource.fields, row, safePresets),
      refOptions,
      suggestions,
      cascade,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not load the editor." };
  }
}
