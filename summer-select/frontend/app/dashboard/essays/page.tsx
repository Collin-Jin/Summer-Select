import { supabaseServer } from "@/utils/supabase/server";
import { EssaysClientView } from "./EssaysClientView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example Essays",
};

/**
 * Example Essays — Server Component.
 * Fetches published essays from Supabase and passes them to the
 * interactive accordion client component.
 */
export default async function EssaysPage() {
  const supabase = await supabaseServer();

  const { data: essays, error } = await supabase
    .from("example_essays")
    .select("*")
    .eq("is_published", true)
    .order("program_slug", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !essays) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-500">
          Unable to load essays. Please try again later.
        </p>
      </div>
    );
  }

  return <EssaysClientView essays={essays} />;
}
