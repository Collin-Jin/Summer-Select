"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProtectedContent } from "@/components/ui/ProtectedContent";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import type { InterviewGuideWithQuestions } from "@/lib/database.types";

const CATEGORY_LABELS: Record<string, { en: string; zh: string }> = {
  icebreakers: { en: "Icebreakers & Self-Awareness", zh: "破冰 & 自我认知" },
  academic: { en: "Academic Background & Research Interests", zh: "学术背景 & 研究兴趣" },
  program_fit: { en: "Program Fit & Adaptability", zh: "项目匹配度 & 适应能力" },
  mentorship: { en: "Mentorship & Independence", zh: "导师关系 & 独立性" },
  behavioral: { en: "Behavioral & Group Dynamics", zh: "行为 & 团队动态" },
  ethics: { en: "Ethics, Philosophy & The Scientific Method", zh: "伦理、哲学 & 科学方法" },
  closing: { en: "Closing", zh: "结束语" },
  motivations: { en: "Motivations & Academic Background", zh: "动机 & 学术背景" },
  personal: { en: "Personal History & Reflection", zh: "个人经历 & 反思" },
  hypothetical: { en: "Hypothetical & Quirky Scenarios", zh: "假设场景" },
  research_scenario: { en: "Research Scenario & Methodology", zh: "研究场景 & 方法论" },
  live_writing: { en: "Live Writing Prompts", zh: "现场写作题目" },
  resource: { en: "Resources & References", zh: "资源 & 参考" },
};

export function InterviewsClientView({
  guides,
}: {
  guides: InterviewGuideWithQuestions[];
}) {
  const { lang } = useLanguage();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [activeGuideId, setActiveGuideId] = useState<string>(
    guides[0]?.id ?? ""
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeGuide = guides.find((g) => g.id === activeGuideId) ?? guides[0];

  if (!activeGuide) return null;

  // Group questions by category for the active guide
  const questionsByCategory = new Map<string, typeof activeGuide.interview_questions>();
  for (const q of activeGuide.interview_questions) {
    const cat = q.category ?? "general";
    if (!questionsByCategory.has(cat)) questionsByCategory.set(cat, []);
    questionsByCategory.get(cat)!.push(q);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "#F0EFF8" }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-600)" }}>
              {lang === "zh" ? "面试准备" : "Interview Prep"}
            </h1>
            <p className="text-sm text-slate-500">
              {lang === "zh"
                ? `${guides.length} 个项目 · ${activeGuide.interview_questions.length} 道面试题`
                : `${guides.length} programs · ${activeGuide.interview_questions.length} questions`}
            </p>
          </div>
        </div>
        <p
          className="text-sm rounded-xl px-4 py-3 border"
          style={{ background: "#F0EFF8", borderColor: "#C4C2E0", color: "#3D3B6B" }}
        >
          {lang === "zh"
            ? "每道题包含攻略提示和高质量范例答案，助你做好充分的面试准备。内容受版权保护，禁止复制或传播。"
            : "Each question includes strategy tips and a sample strong answer. Content is protected — copying or sharing is prohibited."}
        </p>
      </div>

      {/* Program tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {guides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => {
              setActiveGuideId(guide.id);
              setOpenIds(new Set());
            }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
            style={
              guide.id === activeGuideId
                ? {
                    background: "var(--color-brand-500)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(91,95,151,0.25)",
                  }
                : {
                    background: "var(--color-brand-50)",
                    color: "var(--color-brand-600)",
                    border: "1px solid var(--color-brand-100)",
                  }
            }
          >
            {guide.program_name}
          </button>
        ))}
      </div>

      {/* Active guide content */}
      <section>
        {/* Program header row */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--color-brand-600)" }}
          >
            {activeGuide.program_name}
          </h2>
          <Link
            href={`/dashboard/program/${activeGuide.program_slug}`}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--color-brand-500)" }}
          >
            {lang === "zh" ? "查看项目" : "View program"}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Format note */}
        {(activeGuide.format_note || activeGuide.format_note_zh) && (
          <div
            className="mb-5 p-4 rounded-xl border"
            style={{ background: "var(--color-brand-50)", borderColor: "var(--color-brand-100)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-brand-500)" }}
            >
              {lang === "zh" ? "面试形式说明" : "Interview Format"}
            </p>
            <div
              className="text-sm leading-relaxed space-y-3"
              style={{ color: "var(--color-brand-700, #3a3d6e)" }}
            >
              {(lang === "zh" && activeGuide.format_note_zh
                ? activeGuide.format_note_zh
                : activeGuide.format_note ?? ""
              )
                .split("\n\n")
                .filter((para) => para.trim())
                .map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
            </div>
          </div>
        )}

        {/* Questions grouped by category */}
        {Array.from(questionsByCategory.entries()).map(([cat, questions]) => {
          const catLabel = CATEGORY_LABELS[cat];
          return (
            <div key={cat} className="mb-6">
              {catLabel && (
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
                  style={{ color: "var(--color-brand-500)" }}
                >
                  {lang === "zh" ? catLabel.zh : catLabel.en}
                </p>
              )}
              <div className="space-y-3">
                {questions.map((qa, idx) => {
                  const isOpen = openIds.has(qa.id);
                  const hasTips = qa.tips || qa.tips_zh;
                  const hasSample = qa.sample_answer || qa.sample_answer_zh;
                  return (
                    <Card key={qa.id} outlined className="overflow-hidden">
                      <button
                        onClick={() => toggle(qa.id)}
                        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span
                            className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                            style={{
                              background: "var(--color-brand-50)",
                              color: "var(--color-brand-500)",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-700 leading-snug">
                            {lang === "zh" && qa.question_zh
                              ? qa.question_zh
                              : qa.question}
                          </p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                      </button>

                      {isOpen && (hasTips || hasSample) && (
                        <div className="px-5 pb-6 border-t border-slate-100 space-y-5">
                          {/* Tips */}
                          {hasTips && (
                            <ProtectedContent>
                              <div
                                className="mt-4 p-4 rounded-xl border"
                                style={{
                                  background: "#FFF8EC",
                                  borderColor: "#FFE4A0",
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-4 w-4" style={{ color: "#C07A00" }} />
                                  <p
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#92600A" }}
                                  >
                                    {lang === "zh" ? "攻略提示" : "Strategy Tips"}
                                  </p>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: "#6B4800" }}>
                                  {lang === "zh" && qa.tips_zh
                                    ? qa.tips_zh
                                    : qa.tips}
                                </p>
                              </div>
                            </ProtectedContent>
                          )}

                          {/* Sample answer */}
                          {hasSample && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="success" size="sm">
                                  {lang === "zh"
                                    ? "优秀范例答案"
                                    : "Sample Strong Answer"}
                                </Badge>
                              </div>
                              <ProtectedContent>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                  {(lang === "zh" && qa.sample_answer_zh
                                    ? qa.sample_answer_zh
                                    : qa.sample_answer ?? ""
                                  )
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
                              </ProtectedContent>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
