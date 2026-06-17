"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProtectedContent } from "@/components/ui/ProtectedContent";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import type { InterviewGuideWithQuestions } from "@/lib/database.types";

const CATEGORY_LABELS: Record<string, { en: string; zh: string }> = {
  icebreakers:       { en: "Icebreakers & Self-Awareness",          zh: "破冰 & 自我认知" },
  academic:          { en: "Academic Background & Research Interests", zh: "学术背景 & 研究兴趣" },
  program_fit:       { en: "Program Fit & Adaptability",             zh: "项目匹配度 & 适应能力" },
  mentorship:        { en: "Mentorship & Independence",              zh: "导师关系 & 独立性" },
  behavioral:        { en: "Behavioral & Group Dynamics",            zh: "行为 & 团队动态" },
  ethics:            { en: "Ethics, Philosophy & The Scientific Method", zh: "伦理、哲学 & 科学方法" },
  closing:           { en: "Closing",                                zh: "结束语" },
  motivations:       { en: "Motivations & Academic Background",      zh: "动机 & 学术背景" },
  personal:          { en: "Personal History & Reflection",          zh: "个人经历 & 反思" },
  hypothetical:      { en: "Hypothetical & Quirky Scenarios",        zh: "假设场景" },
  research_scenario: { en: "Research Scenario & Methodology",        zh: "研究场景 & 方法论" },
  live_writing:      { en: "Live Writing Prompts",                   zh: "现场写作题目" },
  resource:          { en: "Resources & References",                 zh: "资源 & 参考" },
};

// ── Program selection card ────────────────────────────────────────────────────

function GuideCard({
  guide,
  lang,
  onSelect,
}: {
  guide: InterviewGuideWithQuestions;
  lang: "en" | "zh";
  onSelect: () => void;
}) {
  const questionCount = guide.interview_questions.length;
  const categoryCount = new Set(guide.interview_questions.map((q) => q.category ?? "general")).size;

  return (
    <button
      onClick={onSelect}
      className="group text-left w-full rounded-2xl overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "#FFFFFB",
        border: "1.5px solid var(--color-brand-100)",
        boxShadow: "0 2px 12px rgba(91,95,151,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(91,95,151,0.18)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-brand-300)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(91,95,151,0.07)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-brand-100)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {/* Colored top stripe */}
      <div
        className="h-1.5 w-full"
        style={{
          background: "linear-gradient(90deg, var(--color-brand-400) 0%, var(--color-brand-600) 100%)",
        }}
      />

      <div className="px-5 pt-5 pb-5">
        {/* Program name */}
        <h3
          className="font-bold text-base leading-snug mb-2 pr-6"
          style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}
        >
          {guide.program_name}
        </h3>

        {/* Format note snippet */}
        {(guide.format_note || guide.format_note_zh) && (
          <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "#64748b" }}>
            {lang === "zh" && guide.format_note_zh ? guide.format_note_zh : guide.format_note}
          </p>
        )}

        {/* Stats pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}
          >
            <MessageSquare className="h-3 w-3" />
            {lang === "zh"
              ? `${questionCount} 道题`
              : `${questionCount} question${questionCount !== 1 ? "s" : ""}`}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "#F1F5F9", color: "#475569" }}
          >
            {lang === "zh"
              ? `${categoryCount} 个分类`
              : `${categoryCount} categor${categoryCount !== 1 ? "ies" : "y"}`}
          </span>
        </div>

        {/* CTA row */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--color-brand-50)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--color-brand-500)" }}>
            {lang === "zh" ? "查看题目" : "Browse Questions"}
          </span>
          <span
            className="flex items-center justify-center h-6 w-6 rounded-full transition-transform group-hover:translate-x-0.5"
            style={{ background: "var(--color-brand-100)" }}
          >
            <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--color-brand-600)" }} />
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Interview detail view ─────────────────────────────────────────────────────

function GuideDetailView({
  guide,
  lang,
  onBack,
}: {
  guide: InterviewGuideWithQuestions;
  lang: "en" | "zh";
  onBack: () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const questionsByCategory = new Map<string, typeof guide.interview_questions>();
  for (const q of guide.interview_questions) {
    const cat = q.category ?? "general";
    if (!questionsByCategory.has(cat)) questionsByCategory.set(cat, []);
    questionsByCategory.get(cat)!.push(q);
  }

  const questionCount = guide.interview_questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--color-brand-500)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "所有项目" : "All Programs"}
      </button>

      {/* Program header card */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          border: "1.5px solid var(--color-brand-100)",
          boxShadow: "0 2px 16px rgba(91,95,151,0.08)",
        }}
      >
        {/* Gradient banner */}
        <div
          className="px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #3a3d6e 0%, var(--color-brand-500) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-xl font-extrabold leading-snug"
                style={{ color: "#FFFFFB", fontFamily: "var(--font-syne, sans-serif)" }}
              >
                {guide.program_name}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                >
                  <MessageSquare className="h-3 w-3" />
                  {lang === "zh"
                    ? `${questionCount} 道题`
                    : `${questionCount} question${questionCount !== 1 ? "s" : ""}`}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                >
                  {lang === "zh"
                    ? `${questionsByCategory.size} 个分类`
                    : `${questionsByCategory.size} categor${questionsByCategory.size !== 1 ? "ies" : "y"}`}
                </span>
              </div>
            </div>
            <Link
              href={`/dashboard/program/${guide.program_slug}`}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#FFFFFB",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {lang === "zh" ? "项目详情" : "View Program"}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Format note */}
        {(guide.format_note || guide.format_note_zh) && (
          <div className="px-6 py-4" style={{ background: "var(--color-brand-50)" }}>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-brand-500)" }}
            >
              {lang === "zh" ? "面试形式说明" : "Interview Format"}
            </p>
            <div
              className="text-sm leading-relaxed space-y-3"
              style={{ color: "var(--color-brand-700)" }}
            >
              {(lang === "zh" && guide.format_note_zh
                ? guide.format_note_zh
                : guide.format_note ?? ""
              )
                .split("\n\n")
                .filter((p) => p.trim())
                .map((p, i) => (
                  <p key={i}>{p.trim()}</p>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p
        className="text-sm rounded-xl px-4 py-3 border mb-6"
        style={{ background: "#F0EFF8", borderColor: "#C4C2E0", color: "#3D3B6B" }}
      >
        {lang === "zh"
          ? "每道题包含攻略提示，助你做好充分的面试准备。内容受版权保护，禁止复制或传播。"
          : "Each question includes strategy tips to help you prepare. Content is protected — copying or sharing is prohibited."}
      </p>

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
                          {lang === "zh" && qa.question_zh ? qa.question_zh : qa.question}
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isOpen && hasTips && (
                      <div className="px-5 pb-6 border-t border-slate-100">
                        <ProtectedContent>
                          <div
                            className="mt-4 p-4 rounded-xl border"
                            style={{ background: "#FFF8EC", borderColor: "#FFE4A0" }}
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
                              {lang === "zh" && qa.tips_zh ? qa.tips_zh : qa.tips}
                            </p>
                          </div>
                        </ProtectedContent>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function InterviewsClientView({
  guides,
}: {
  guides: InterviewGuideWithQuestions[];
}) {
  const { lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const grandTotalQuestions = guides.reduce((s, g) => s + g.interview_questions.length, 0);
  const selectedGuide = selectedId ? (guides.find((g) => g.id === selectedId) ?? null) : null;

  // ── Program detail view ──
  if (selectedGuide) {
    return (
      <GuideDetailView
        guide={selectedGuide}
        lang={lang}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  // ── Program selection grid ──
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
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
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === "zh"
                ? `${grandTotalQuestions} 道题目 · ${guides.length} 个项目`
                : `${grandTotalQuestions} questions across ${guides.length} programs`}
            </p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <p
          className="text-sm rounded-xl px-4 py-3 border"
          style={{ background: "#F0EFF8", borderColor: "#C4C2E0", color: "#3D3B6B" }}
        >
          {lang === "zh"
            ? "每道题包含攻略提示，助你做好充分的面试准备。内容受版权保护，禁止复制或传播。"
            : "Each question includes strategy tips to help you prepare. Content is protected — copying or sharing is prohibited."}
        </p>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-brand-400)" }}
        >
          {lang === "zh" ? "选择项目" : "Select a Program"}
        </p>
        <div className="flex-1 h-px" style={{ background: "var(--color-brand-100)" }} />
      </div>

      {/* Program cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            lang={lang}
            onSelect={() => setSelectedId(guide.id)}
          />
        ))}
      </div>
    </div>
  );
}
