import { supabaseServer } from "@/utils/supabase/server";
import { InterviewsClientView } from "./InterviewsClientView";
import type { Metadata } from "next";
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
  const supabase = await supabaseServer();

  const { data: guides, error } = await supabase
    .from("interview_guides")
    .select("*, interview_questions(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

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
    interview_questions: [...g.interview_questions].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
  }));

  return <InterviewsClientView guides={sorted} />;
}
