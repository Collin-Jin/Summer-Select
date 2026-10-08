import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArrangeGroup, ArrangeKind } from "./arrangeTypes";

type Row = Record<string, unknown>;

const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" ? v : 0);
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/**
 * Programs (in the order students see them) with their essay prompts.
 * Programs are ordered by their first prompt, exactly like the Essays page.
 */
async function loadEssayGroups(supabase: SupabaseClient): Promise<ArrangeGroup[]> {
  const [promptsRes, programsRes] = await Promise.all([
    supabase
      .from("summer_program_prompts")
      .select("id, program_slug, prompt_en, order, program_order, is_published, program_example_essays(id)")
      .order("program_order", { ascending: true })
      .order("order", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("summer_programs").select("lid, slug, name_en"),
  ]);
  if (promptsRes.error) throw new Error(`Could not load prompts: ${promptsRes.error.message}`);
  if (programsRes.error) throw new Error(`Could not load programs: ${programsRes.error.message}`);

  const programs = new Map<string, Row>();
  for (const p of (programsRes.data ?? []) as Row[]) programs.set(s(p.slug), p);

  const groups = new Map<string, ArrangeGroup>();
  for (const p of (promptsRes.data ?? []) as Row[]) {
    const slug = s(p.program_slug);
    let group = groups.get(slug);
    if (!group) {
      const program = programs.get(slug);
      group = {
        id: slug,
        title: s(program?.name_en) || slug,
        subtitle: slug,
        href: program ? `/admin/programs/${s(program.lid)}` : "/admin/programs",
        items: [],
      };
      groups.set(slug, group);
    }
    const essayCount = Array.isArray(p.program_example_essays) ? p.program_example_essays.length : 0;
    const badges: ArrangeGroup["items"][number]["badges"] = [
      { text: `${essayCount} ${essayCount === 1 ? "essay" : "essays"}`, tone: essayCount === 0 ? "warn" : "plain" },
    ];
    if (p.is_published === false) badges.push({ text: "Draft", tone: "warn" });
    group.items.push({
      id: s(p.id),
      title: clip(s(p.prompt_en), 220) || "Untitled prompt",
      badges,
      href: `/admin/prompts/${s(p.id)}`,
    });
  }
  return Array.from(groups.values());
}

/** Interview guides (in display order) with their questions. */
async function loadInterviewGroups(supabase: SupabaseClient): Promise<ArrangeGroup[]> {
  const { data, error } = await supabase
    .from("interview_guides")
    .select("id, program_name, program_slug, sort_order, is_published, interview_questions(id, question, category, sort_order, is_published)")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(`Could not load interview guides: ${error.message}`);

  return ((data ?? []) as Row[]).map((g) => {
    const questions = (Array.isArray(g.interview_questions) ? (g.interview_questions as Row[]) : [])
      .slice()
      .sort((a, b) => n(a.sort_order) - n(b.sort_order) || s(a.id).localeCompare(s(b.id)));
    return {
      id: s(g.id),
      title: s(g.program_name) || "Interview guide",
      subtitle: g.is_published === false ? "Draft" : s(g.program_slug),
      href: `/admin/guides/${s(g.id)}`,
      items: questions.map((q) => {
        const badges: ArrangeGroup["items"][number]["badges"] = [];
        if (s(q.category)) badges.push({ text: s(q.category).replace(/_/g, " "), tone: "plain" });
        if (q.is_published === false) badges.push({ text: "Draft", tone: "warn" });
        return {
          id: s(q.id),
          title: clip(s(q.question), 220) || "Untitled question",
          badges,
          href: `/admin/questions/${s(q.id)}`,
        };
      }),
    };
  });
}

export async function loadArrangeGroups(
  supabase: SupabaseClient,
  kind: ArrangeKind
): Promise<ArrangeGroup[]> {
  return kind === "essays" ? loadEssayGroups(supabase) : loadInterviewGroups(supabase);
}
