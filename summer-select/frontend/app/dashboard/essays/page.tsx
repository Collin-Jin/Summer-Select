import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { EssaysClientView } from "./EssaysClientView";
import type { Metadata } from "next";
import { getEditing } from "@/lib/admin/editMode";

export const metadata: Metadata = {
  title: "Example Essays",
};

export type ProgramDescription = {
  /** Primary key, used by the admin's in-page editor. */
  lid: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  collin_rationale_en: string | null;
  collin_rationale_zh: string | null;
};

/** A program that exists in the directory but has no essay prompts yet (Edit mode only). */
export type EmptyProgram = {
  lid: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  is_published: boolean | null;
};

export default async function EssaysPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string | string[] }>;
}) {
  // `?program=<slug>` opens that program's essays directly (linked from the program page).
  const { program } = await searchParams;
  const requested = Array.isArray(program) ? program[0] : program;
  const initialSlug = requested && /^[a-z0-9-]{1,100}$/.test(requested) ? requested : null;

  const viewer = await getViewer();
  if (!viewer.isPaid) {
    return (
      <LockedFeature
        feature="essays"
        access={viewer.access}
        nextPath={initialSlug ? `/dashboard/essays?program=${initialSlug}` : "/dashboard/essays"}
      />
    );
  }

  const supabase = await supabaseServer();

  // The admin sees drafts and empty prompts while Edit mode is on.
  const editing = await getEditing();

  let promptsQuery = supabase
    .from("summer_program_prompts")
    .select("*, program_example_essays(*)");
  if (!editing) promptsQuery = promptsQuery.eq("is_published", true);
  const { data: prompts, error } = await promptsQuery
    .order("program_order", { ascending: true })
    .order("order", { ascending: true })
    .order("id", { ascending: true });

  if (error || !prompts) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-500">
          Unable to load essays. Please try again later.
        </p>
      </div>
    );
  }

  // Students only see prompts that have at least one published essay.
  const publishedPrompts = prompts
    .map((p) => ({
      ...p,
      program_example_essays: (p.program_example_essays as { is_published: boolean | null }[]).filter(
        (e) => editing || e.is_published !== false
      ),
    }))
    .filter((p) => editing || p.program_example_essays.length > 0);

  const uniqueSlugs = [...new Set(publishedPrompts.map((p) => p.program_slug))];

  const { data: programs } = await supabase
    .from("summer_programs")
    .select("lid, slug, name_en, name_zh, collin_rationale_en, collin_rationale_zh")
    .in("slug", uniqueSlugs);

  const programDescriptions: Record<string, ProgramDescription> = {};
  for (const p of programs ?? []) {
    programDescriptions[p.slug] = p as ProgramDescription;
  }

  // In Edit mode, also list directory programs that have no prompts yet, so the
  // admin can start adding essays for a program (e.g. one just created).
  let emptyPrograms: EmptyProgram[] = [];
  if (editing) {
    const { data: all } = await supabase
      .from("summer_programs")
      .select("lid, slug, name_en, name_zh, is_published")
      .order("name_en", { ascending: true });
    const used = new Set(uniqueSlugs);
    emptyPrograms = ((all ?? []) as EmptyProgram[]).filter((p) => !used.has(p.slug));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <EssaysClientView
      prompts={publishedPrompts}
      programDescriptions={programDescriptions}
      emptyPrograms={emptyPrograms}
      initialSlug={initialSlug}
      userEmail={user?.email ?? null}
    />
  );
}
