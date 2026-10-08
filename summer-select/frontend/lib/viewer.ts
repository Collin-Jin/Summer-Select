import { cache } from "react";
import { supabaseServer } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { ViewerAccess } from "@/lib/access";
import { isAdminEmail } from "@/lib/admin/config";

export interface Viewer {
  user: User | null;
  isPaid: boolean;
  access: ViewerAccess;
  /** The site owner. Treated as a paid member everywhere, plus edit rights. */
  isAdmin: boolean;
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

  if (!user) return { user: null, isPaid: false, access: "guest", isAdmin: false };

  // The owner sees everything a paid member sees (and can edit it).
  const isAdmin = isAdminEmail(user.email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single();

  const isPaid = isAdmin || profile?.is_paid === true;
  return { user, isPaid, access: isPaid ? "paid" : "unpaid", isAdmin };
});
