"use server";

import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { getAdminContext } from "@/lib/admin/auth";
import { getRawRecord, isValidId, parentHref } from "@/lib/admin/data";
import { getResource, type ResourceDef, type Values } from "@/lib/admin/resources";
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
