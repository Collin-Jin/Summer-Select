import { supabaseClient } from "@/lib/supabase/client";
import type { Favorite } from "@/lib/database.types";

/**
 * Client-side favorites service for Summer Select.
 * All functions use the browser Supabase client and rely on RLS
 * to scope operations to the currently authenticated user.
 */

/**
 * Fetches all favorite rows for the current authenticated user.
 *
 * @returns Array of Favorite rows (with `program_id` fields).
 */
export async function fetchFavorites(): Promise<Favorite[]> {
  const supabase = supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("[fetchFavorites] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Adds a program to the current user's favorites.
 * Silently succeeds if the program is already favorited (ON CONFLICT DO NOTHING via unique constraint).
 *
 * @param programId - The `lid` UUID of the program to favorite.
 * @returns The newly created Favorite row, or null on error.
 */
export async function addFavorite(programId: string): Promise<Favorite | null> {
  const supabase = supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, program_id: programId })
    .select()
    .single();

  if (error) {
    // Ignore duplicate key violations (user already favorited this)
    if (!error.message.includes("duplicate") && !error.message.includes("unique")) {
      console.error("[addFavorite] Supabase error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Removes a program from the current user's favorites.
 *
 * @param programId - The `lid` UUID of the program to un-favorite.
 * @returns True on success, false on error.
 */
export async function removeFavorite(programId: string): Promise<boolean> {
  const supabase = supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("program_id", programId);

  if (error) {
    console.error("[removeFavorite] Supabase error:", error.message);
    return false;
  }

  return true;
}

/** Fields a user can edit on a saved program. */
export type FavoritePatch = Partial<
  Pick<Favorite, "rating" | "notes" | "status">
>;

/**
 * Updates the rating, notes or application status of a saved program.
 * RLS limits the update to the current user's own row.
 *
 * @param programId - The `lid` UUID of the saved program.
 * @param patch - Fields to change. `rating` is 1–5 or null to clear.
 * @returns True on success, false on error.
 */
export async function updateFavorite(
  programId: string,
  patch: FavoritePatch
): Promise<boolean> {
  const supabase = supabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("favorites")
    .update(patch)
    .eq("user_id", user.id)
    .eq("program_id", programId)
    .select("id");

  if (error) {
    console.error("[updateFavorite] Supabase error:", error.message);
    return false;
  }

  // Zero rows means the program is no longer saved (e.g. removed in another tab).
  return (data?.length ?? 0) > 0;
}
