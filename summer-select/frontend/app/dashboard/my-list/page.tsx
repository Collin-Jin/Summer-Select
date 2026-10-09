import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { getProgramsByIds } from "@/lib/programs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginUrl } from "@/lib/access";
import type { Lang } from "@/lib/database.types";
import { MyListClientView } from "./MyListClientView";

export const metadata: Metadata = {
  title: "My List",
};

/**
 * My List Page — Server Component.
 *
 * Fetches the current user's saved favorites from the `favorites` table,
 * then resolves the full program data for each favorited program ID.
 * Delegates all interactivity (remove from list) to <MyListClientView>.
 */
export default async function MyListPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy redirects guests first; this is the server-side backstop.
  if (!user) redirect(loginUrl("/dashboard/my-list"));

  // Fetch all favorite rows for this user
  const { data: favRows } = await supabase
    .from("favorites")
    .select("program_id, id")
    .eq("user_id", user.id);

  const programIds = (favRows ?? []).map((f) => f.program_id);
  const programs = await getProgramsByIds(programIds);

  const cookieStore = await cookies();
  const rawLang = cookieStore.get("lang")?.value;
  const lang: Lang = rawLang === "en" || rawLang === "zh" ? rawLang : "en";

  return <MyListClientView programs={programs} lang={lang} />;
}
