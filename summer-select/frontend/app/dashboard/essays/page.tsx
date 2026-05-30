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

  const { data: prompts, error } = await supabase
    .from("summer_program_prompts")
    .select("*, program_example_essays(*)")
    .eq("is_published", true)
    .order("program_order", { ascending: true })
    .order("order", { ascending: true });

  if (error || !prompts) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-500">
          Unable to load essays. Please try again later.
        </p>
      </div>
    );
  }

  // Filter to only prompts that have at least one published essay
  const publishedPrompts = prompts.map((p) => ({
    ...p,
    program_example_essays: (p.program_example_essays as { is_published: boolean | null }[]).filter(
      (e) => e.is_published !== false
    ),
  })).filter((p) => p.program_example_essays.length > 0);

  const uniqueSlugs = [...new Set(publishedPrompts.map((p) => p.program_slug))];

  const { data: programs } = await supabase
    .from("summer_programs")
    .select("slug, name_en, name_zh, collin_rationale_en, collin_rationale_zh")
    .in("slug", uniqueSlugs);

  const programDescriptions: Record<string, ProgramDescription> = {};
  for (const p of programs ?? []) {
    programDescriptions[p.slug] = p as ProgramDescription;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <EssaysClientView
      prompts={publishedPrompts}
      programDescriptions={programDescriptions}
      userEmail={user?.email ?? null}
    />
  );
}
