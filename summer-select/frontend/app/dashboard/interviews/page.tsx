import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { InterviewsClientView } from "./InterviewsClientView";
import type { Metadata } from "next";
import { getEditing } from "@/lib/admin/editMode";
import type { InterviewGuideWithQuestions } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Interview Prep",
};

/**
 * Interview Prep — Server Component.
 * Fetches published interview guides and their questions from Supabase,
 * then passes to the interactive accordion client component.
 */
export default async function InterviewsPage() {
  const viewer = await getViewer();
  if (!viewer.isPaid) {
    return <LockedFeature feature="interviews" access={viewer.access} nextPath="/dashboard/interviews" />;
  }

  const supabase = await supabaseServer();

  // The admin sees drafts while Edit mode is on.
  const editing = await getEditing();

  let query = supabase.from("interview_guides").select("*, interview_questions(*)");
  if (!editing) query = query.eq("is_published", true);
  const { data: guides, error } = await query
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error || !guides) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-500">
          Unable to load interview guides. Please try again later.
        </p>
      </div>
    );
  }

  // Sort questions within each guide by sort_order
  const sorted = (guides as InterviewGuideWithQuestions[]).map((g) => ({
    ...g,
    interview_questions: g.interview_questions
      .filter((q) => editing || q.is_published !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  return <InterviewsClientView guides={sorted} />;
}
