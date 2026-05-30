"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WatermarkedContent } from "@/components/ui/WatermarkedContent";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import type { SummerProgramPromptWithEssays } from "@/lib/database.types";
import type { ProgramDescription } from "./page";

interface ProgramGroup {
  programSlug: string;
  programName: string;
  prompts: SummerProgramPromptWithEssays[];
}

function buildProgramGroups(prompts: SummerProgramPromptWithEssays[]): ProgramGroup[] {
  const programMap = new Map<string, ProgramGroup>();

  for (const prompt of prompts) {
    const { program_slug } = prompt;
    if (!programMap.has(program_slug)) {
      // Derive display name from the first essay in this prompt
      const firstName = prompt.program_example_essays[0]?.program_name ?? program_slug;
      programMap.set(program_slug, {
        programSlug: program_slug,
        programName: firstName,
        prompts: [],
      });
    }
    programMap.get(program_slug)!.prompts.push(prompt);
  }

  return Array.from(programMap.values());
}

export function EssaysClientView({
  prompts,
  programDescriptions,
  userEmail,
}: {
  prompts: SummerProgramPromptWithEssays[];
  programDescriptions: Record<string, ProgramDescription>;
  userEmail: string | null;
}) {
  const { lang } = useLanguage();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const groups = buildProgramGroups(prompts);
  const [activeProgramSlug, setActiveProgramSlug] = useState<string>(
    groups[0]?.programSlug ?? ""
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeGroup = groups.find((g) => g.programSlug === activeProgramSlug) ?? groups[0];
  const desc = activeGroup ? programDescriptions[activeGroup.programSlug] : null;

  if (!activeGroup) return null;

  const programEssayCount = activeGroup.prompts.reduce(
    (s, p) => s + p.program_example_essays.length,
    0
  );
  const grandTotalEssays = prompts.reduce(
    (s, p) => s + p.program_example_essays.length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-brand-100)" }}
          >
            <BookOpen className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-600)" }}>
              {lang === "zh" ? "范文参考" : "Example Essays"}
            </h1>
          </div>
        </div>
        <p
          className="text-sm rounded-xl px-4 py-3 border"
          style={{
            background: "#FFF8EC",
            borderColor: "#FFE4A0",
            color: "#92600A",
          }}
        >
          {lang === "zh"
            ? "这些文书来自真实的成功申请者，用于学习写作结构和风格，请勿抄袭。内容受版权保护，禁止复制或传播。"
            : "These essays are from real successful applicants and are provided for structural and stylistic reference only. Do not plagiarize. Content is protected — copying or sharing is prohibited."}
        </p>
        <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-400">
          <span className="tabular-nums">
            {lang === "zh"
              ? `本项目 ${programEssayCount} 篇 · ${activeGroup.prompts.length} 道题目`
              : `${programEssayCount} essay${programEssayCount !== 1 ? "s" : ""} · ${activeGroup.prompts.length} prompt${activeGroup.prompts.length !== 1 ? "s" : ""}`}
          </span>
          <span className="tabular-nums text-slate-500">
            {lang === "zh"
              ? `共 ${grandTotalEssays} 篇 · ${groups.length} 个项目`
              : `${grandTotalEssays} total · ${groups.length} programs`}
          </span>
        </div>
      </div>

      {/* Program tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {groups.map((group) => (
          <button
            key={group.programSlug}
            onClick={() => {
              setActiveProgramSlug(group.programSlug);
              setOpenIds(new Set());
            }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
            style={
              group.programSlug === activeProgramSlug
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
            {group.programName}
          </button>
        ))}
      </div>

      {/* Active program content */}
      <section>
        {/* Program header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-brand-600)" }}>
            {desc
              ? lang === "zh" && desc.name_zh
                ? desc.name_zh
                : desc.name_en
              : activeGroup.programName}
          </h2>
          <Link
            href={`/dashboard/program/${activeGroup.programSlug}`}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--color-brand-500)" }}
          >
            {lang === "zh" ? "查看项目" : "View program"}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Program description */}
        {desc && (desc.collin_rationale_en || desc.collin_rationale_zh) && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{ background: "var(--color-brand-50)", borderColor: "var(--color-brand-100)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-brand-500)" }}
            >
              {lang === "zh" ? "项目简介" : "About this Program"}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-brand-700, #3a3d6e)" }}>
              {lang === "zh" && desc.collin_rationale_zh
                ? desc.collin_rationale_zh
                : desc.collin_rationale_en}
            </p>
          </div>
        )}

        {/* Prompts with grouped essays */}
        <div className="space-y-8">
          {activeGroup.prompts.map((prompt, promptIdx) => (
            <div key={prompt.id}>
              {/* Prompt header */}
              <div
                className="mb-3 px-4 py-3 rounded-xl border"
                style={{ background: "#F8F7FD", borderColor: "var(--color-brand-100)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-brand-500)" }}
                >
                  {lang === "zh" ? `题目 ${promptIdx + 1}` : `Prompt ${promptIdx + 1}`}
                </p>
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-brand-700, #3a3d6e)" }}>
                  {lang === "zh" && prompt.prompt_zh
                    ? prompt.prompt_zh
                    : prompt.prompt_en}
                </p>
              </div>

              {/* Essays under this prompt */}
              <div className="space-y-3 pl-2">
                {prompt.program_example_essays
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((essay, essayIdx) => {
                    const isOpen = openIds.has(essay.id);
                    return (
                      <Card key={essay.id} outlined className="overflow-hidden">
                        {/* Accordion trigger */}
                        <button
                          onClick={() => toggle(essay.id)}
                          className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "var(--color-brand-400)" }}
                              >
                                {lang === "zh" ? `示例 ${essayIdx + 1}` : `Example ${essayIdx + 1}`}
                              </span>
                              {essay.outcome && (
                                <Badge variant="success" size="sm">
                                  {essay.outcome}
                                </Badge>
                              )}
                              {essay.year && (
                                <Badge variant="default" size="sm">
                                  {essay.year}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>

                        {/* Expanded essay body */}
                        {isOpen && (
                          <div className="px-5 pb-6 border-t border-slate-100">
                            {/* Language indicator — essays are English only */}
                            <div className="flex gap-1 my-4">
                              <span
                                className="px-3 py-1 text-xs rounded-lg font-medium"
                                style={{ background: "var(--color-brand-500)", color: "#fff" }}
                              >
                                EN
                              </span>
                            </div>

                            {/* Essay body — copy protected + watermarked */}
                            <WatermarkedContent userEmail={userEmail}>
                              <div className="prose prose-sm prose-slate max-w-none">
                                {essay.essay
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
                            </WatermarkedContent>
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
