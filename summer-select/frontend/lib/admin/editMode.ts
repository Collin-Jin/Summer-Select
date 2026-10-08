import { cookies } from "next/headers";
import { getViewer } from "@/lib/viewer";

/** Cookie that remembers whether the admin has "Edit mode" switched on. */
export const EDIT_COOKIE = "ss_edit";

/**
 * True only for the admin with Edit mode on. Server pages use this to include
 * drafts and show editing tools; everyone else gets the normal public view.
 */
export async function getEditing(): Promise<boolean> {
  const { isAdmin } = await getViewer();
  if (!isAdmin) return false;
  const store = await cookies();
  return store.get(EDIT_COOKIE)?.value === "1";
}
