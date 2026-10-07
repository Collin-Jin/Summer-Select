import { cache } from "react";
import { supabaseServer } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { ViewerAccess } from "@/lib/access";

export interface Viewer {
  user: User | null;
  isPaid: boolean;
  access: ViewerAccess;
}

/**
 * Resolves the current visitor on the server. Memoised per request, so layouts,
 * pages and data helpers can all call it without repeating the network calls.
 *
 * Uses getUser() (validated against Supabase), never the unverified cookie.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isPaid: false, access: "guest" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single();

  const isPaid = profile?.is_paid === true;
  return { user, isPaid, access: isPaid ? "paid" : "unpaid" };
});
