import { supabaseServer } from "@/utils/supabase/server";
import { EssaysClientView } from "./EssaysClientView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example Essays",
};

export type ProgramDescription = {
  slug: string;
  name_en: string;
  name_zh: string | null;
  collin_rationale_en: string | null;
  collin_rationale_zh: string | null;
};

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

  const uniqueSlugs = [...new Set(essays.map((e) => e.program_slug))];

  const { data: programs } = await supabase
    .from("summer_programs")
    .select("slug, name_en, name_zh, collin_rationale_en, collin_rationale_zh")
    .in("slug", uniqueSlugs);

  const programDescriptions: Record<string, ProgramDescription> = {};
  for (const p of programs ?? []) {
    programDescriptions[p.slug] = p as ProgramDescription;
  }

  return <EssaysClientView essays={essays} programDescriptions={programDescriptions} />;
}
