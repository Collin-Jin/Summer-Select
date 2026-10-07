import { notFound, redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseServer } from "@/utils/supabase/server";
import { getViewer } from "@/lib/viewer";
import { loginUrl } from "@/lib/access";
import { isAdminEmail } from "./config";

export interface AdminContext {
  user: User;
  supabase: SupabaseClient;
}

/**
 * For Server Components / layouts. Guests are sent to log in; signed-in
 * non-admins get a 404 so the admin area isn't advertised.
 *
 * This is a convenience layer only: the database enforces admin-only writes
 * itself (RLS policies using public.is_admin()), so even a bypassed check here
 * could not change any data.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const { user } = await getViewer();
  if (!user) redirect(loginUrl("/admin"));
  if (!isAdminEmail(user.email)) notFound();
  return { user, supabase: await supabaseServer() };
}

/**
 * For Server Actions. Never redirects; returns null when the caller is not the
 * admin so the action can return a clean error to the form.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return { user, supabase };
}
