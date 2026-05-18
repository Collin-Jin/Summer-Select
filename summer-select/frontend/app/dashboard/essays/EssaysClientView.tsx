"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProtectedContent } from "@/components/ui/ProtectedContent";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { clsx } from "clsx";
import type { ExampleEssay } from "@/lib/database.types";

interface EssayGroup {
  programName: string;
  programSlug: string;
  essays: ExampleEssay[];
}

function groupEssays(essays: ExampleEssay[]): EssayGroup[] {
  const map = new Map<string, EssayGroup>();
  for (const essay of essays) {
    if (!map.has(essay.program_slug)) {
      map.set(essay.program_slug, {
        programName: essay.program_name,
        programSlug: essay.program_slug,
        essays: [],
      });
    }
    map.get(essay.program_slug)!.essays.push(essay);
  }
  return Array.from(map.values());
}

export function EssaysClientView({ essays }: { essays: ExampleEssay[] }) {
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

  const groups = groupEssays(essays);
  const totalEssays = essays.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
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
            <p className="text-sm text-slate-500">
              {lang === "zh"
                ? `${groups.length} 个项目 · ${totalEssays} 篇文书`
                : `${groups.length} programs · ${totalEssays} essays`}
            </p>
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
      </div>

      {/* Essay groups */}
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.programSlug}>
            {/* Program section header */}
            <div
              className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl"
              style={{ background: "var(--color-brand-50)" }}
            >
              <h2 className="text-base font-bold" style={{ color: "var(--color-brand-600)" }}>
                {group.programName}
              </h2>
              <Link
                href={`/dashboard/program/${group.programSlug}`}
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: "var(--color-brand-500)" }}
              >
                {lang === "zh" ? "查看项目" : "View program"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {group.essays.map((essay) => {
                const isOpen = openIds.has(essay.id);
                const prompt = lang === "zh" && essay.prompt_zh ? essay.prompt_zh : essay.prompt;
                return (
                  <Card key={essay.id} outlined className="overflow-hidden">
                    {/* Accordion trigger */}
                    <button
                      onClick={() => toggle(essay.id)}
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
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
                          {essay.word_count && (
                            <Badge variant="outline" size="sm">
                              ~{essay.word_count}{" "}
                              {lang === "zh" ? "词" : "words"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-snug mt-2">
                          {prompt}
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
                      <div className="px-5 pb-6 border-t border-slate-100">
                        {/* Prompt */}
                        <div
                          className="mt-4 mb-5 p-4 rounded-xl"
                          style={{ background: "var(--color-brand-50)" }}
                        >
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                            style={{ color: "var(--color-brand-500)" }}
                          >
                            {lang === "zh" ? "题目" : "Prompt"}
                          </p>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--color-brand-700, #3a3d6e)" }}
                          >
                            {prompt}
                          </p>
                        </div>

                        {/* Language indicator */}
                        <div className="flex gap-1 mb-4">
                          {(["en", "zh"] as const).map((l) => (
                            <span
                              key={l}
                              className={clsx(
                                "px-3 py-1 text-xs rounded-lg font-medium",
                                lang === l
                                  ? "text-white"
                                  : "bg-slate-100 text-slate-500"
                              )}
                              style={
                                lang === l
                                  ? { background: "var(--color-brand-500)" }
                                  : {}
                              }
                            >
                              {l === "en" ? "EN" : "中文"}
                            </span>
                          ))}
                        </div>

                        {/* Essay body — copy protected */}
                        <ProtectedContent>
                          <div className="prose prose-sm prose-slate max-w-none">
                            {(lang === "zh" && essay.essay_zh
                              ? essay.essay_zh
                              : essay.essay
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
