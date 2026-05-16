"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, ExternalLink, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { INTERVIEW_GUIDES } from "@/data/interviews";
import Link from "next/link";

/**
 * Interviews Page — Client Component.
 *
 * Displays interview preparation guides for 2 programs:
 * each guide includes format notes and a set of Q&A cards with tips and sample answers.
 * Questions collapse/expand via accordion.
 */
export default function InterviewsPage() {
  const { lang } = useLanguage();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalQuestions = INTERVIEW_GUIDES.reduce(
    (s, g) => s + g.questions.length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {lang === "zh" ? "面试准备" : "Interview Prep"}
            </h1>
            <p className="text-sm text-slate-500">
              {lang === "zh"
                ? `${INTERVIEW_GUIDES.length} 个项目 · ${totalQuestions} 道面试题`
                : `${INTERVIEW_GUIDES.length} programs · ${totalQuestions} questions`}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          {lang === "zh"
            ? "每道题包含攻略提示和高质量范例答案，助你做好充分的面试准备。"
            : "Each question includes strategy tips and a sample strong answer to help you prepare thoroughly."}
        </p>
      </div>

      {/* Interview guides */}
      <div className="space-y-10">
        {INTERVIEW_GUIDES.map((guide) => (
          <section key={guide.programSlug}>
            {/* Program header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-700">
                {guide.programName}
              </h2>
              <Link
                href={`/dashboard/program/${guide.programSlug}`}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                {lang === "zh" ? "查看项目" : "View program"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Format note */}
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">
                {lang === "zh" ? "面试形式说明" : "Interview Format"}
              </p>
              <p className="text-sm text-blue-900 leading-relaxed">
                {lang === "zh" ? guide.formatNoteZh : guide.formatNote}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {guide.questions.map((qa, idx) => {
                const isOpen = openIds.has(qa.id);
                return (
                  <Card key={qa.id} outlined className="overflow-hidden">
                    {/* Accordion trigger */}
                    <button
                      onClick={() => toggle(qa.id)}
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-slate-700 leading-snug">
                          {lang === "zh" ? qa.questionZh : qa.question}
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="px-5 pb-6 border-t border-slate-100 space-y-5">
                        {/* Tips */}
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-amber-600" />
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                              {lang === "zh" ? "攻略提示" : "Strategy Tips"}
                            </p>
                          </div>
                          <p className="text-sm text-amber-900 leading-relaxed">
                            {lang === "zh" ? qa.tipsZh : qa.tips}
                          </p>
                        </div>

                        {/* Sample answer */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="success" size="sm">
                              {lang === "zh" ? "优秀范例答案" : "Sample Strong Answer"}
                            </Badge>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            {(lang === "zh" ? qa.sampleAnswerZh : qa.sampleAnswer)
                              .split("\n\n")
                              .map((para, i) => (
                                <p
                                  key={i}
                                  className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0"
                                >
                                  {para}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
