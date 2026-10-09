"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin/auth";

export type SaveOriginalResult =
  | { ok: true; message: string; savedAt: string }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CHARS = 100_000;

/**
 * Saves the untouched original of one example essay. Admin only (checked here
 * and again by RLS on public.essay_originals). Clearing the text removes the
 * row so "empty" always means "not entered yet".
 */
export async function saveEssayOriginal(
  essayId: string,
  text: string
): Promise<SaveOriginalResult> {
  const ctx = await getAdminContext();
  if (!ctx) {
    return { ok: false, error: "You need to be signed in as the site admin to do that." };
  }
  if (typeof essayId !== "string" || !UUID_RE.test(essayId)) {
    return { ok: false, error: "Invalid essay." };
  }
  if (typeof text !== "string") return { ok: false, error: "Invalid text." };

  const clean = text.replace(/\r\n/g, "\n");
  if (clean.length > MAX_CHARS) {
    return { ok: false, error: `Too long (maximum ${MAX_CHARS.toLocaleString()} characters).` };
  }

  const savedAt = new Date().toISOString();

  if (clean.trim() === "") {
    const { error } = await ctx.supabase.from("essay_originals").delete().eq("essay_id", essayId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await ctx.supabase
      .from("essay_originals")
      .upsert({ essay_id: essayId, original_text: clean, updated_at: savedAt }, { onConflict: "essay_id" });
    if (error) {
      if (error.code === "23503") {
        return { ok: false, error: "That example essay no longer exists. Reload the page." };
      }
      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/originals");
  return { ok: true, message: clean.trim() === "" ? "Cleared." : "Saved.", savedAt };
}
