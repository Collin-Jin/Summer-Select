import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { OriginalsClientView, type OriginalsEssay } from "./OriginalsClientView";

export const metadata: Metadata = {
  title: "Original Essays",
  robots: { index: false, follow: false },
};

// Always fresh and never cached across users: this page shows private data.
export const dynamic = "force-dynamic";

/**
 * Admin-only: every example essay, with the edited version students see next
 * to the untouched original (kept in the admin-only `essay_originals` table).
 */
export default async function OriginalsPage() {
  // Non-admins get a 404 (the tab isn't advertised to them either).
  const { supabase } = await requireAdmin();

  const [{ data: prompts, error }, { data: originals, error: originalsError }] = await Promise.all([
    supabase
      .from("summer_program_prompts")
      .select("id, program_slug, prompt_en, order, program_order, program_example_essays(*)")
      .order("program_order", { ascending: true })
      .order("order", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("essay_originals").select("essay_id, original_text"),
  ]);

  if (error || originalsError || !prompts) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-500">
          Unable to load essays{originalsError ? " (is the essay_originals migration applied?)" : ""}.
          Please try again.
        </p>
      </div>
    );
  }

  const originalById = new Map((originals ?? []).map((o) => [o.essay_id as string, o.original_text as string]));

  const essays: OriginalsEssay[] = [];
  for (const p of prompts) {
    const rows = [...((p.program_example_essays ?? []) as {
      id: string;
      program_name: string;
      essay: string;
      year: number | null;
      outcome: string | null;
      sort_order: number | null;
      is_published: boolean | null;
    }[])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    for (const e of rows) {
      essays.push({
        id: e.id,
        programSlug: p.program_slug,
        programName: e.program_name,
        prompt: p.prompt_en,
        year: e.year,
        outcome: e.outcome,
        published: e.is_published !== false,
        edited: e.essay,
        original: originalById.get(e.id) ?? "",
      });
    }
  }

  return <OriginalsClientView essays={essays} />;
}
