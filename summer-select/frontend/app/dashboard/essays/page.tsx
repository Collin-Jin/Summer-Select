"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { ESSAY_GROUPS } from "@/data/essays";
import Link from "next/link";
import { clsx } from "clsx";

/**
 * Example Essays Page — Client Component (uses accordion interactivity).
 *
 * Displays a curated set of successful application essays grouped by program.
 * Each essay is shown in a collapsible accordion panel.
 * All UI labels switch based on the current language.
 */
export default function EssaysPage() {
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {lang === "zh" ? "范文参考" : "Example Essays"}
            </h1>
            <p className="text-sm text-slate-500">
              {lang === "zh"
                ? `${ESSAY_GROUPS.length} 个项目 · ${ESSAY_GROUPS.reduce((s, g) => s + g.essays.length, 0)} 篇文书`
                : `${ESSAY_GROUPS.length} programs · ${ESSAY_GROUPS.reduce((s, g) => s + g.essays.length, 0)} essays`}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {lang === "zh"
            ? "这些文书来自真实的成功申请者，用于学习写作结构和风格，请勿抄袭。"
            : "These essays are from real successful applicants and are provided for structural and stylistic reference only. Do not plagiarize."}
        </p>
      </div>

      {/* Essay groups */}
      <div className="space-y-8">
        {ESSAY_GROUPS.map((group) => (
          <section key={group.programSlug}>
            {/* Program section header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-700">
                {group.programName}
              </h2>
              <Link
                href={`/dashboard/program/${group.programSlug}`}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                {lang === "zh" ? "查看项目" : "View program"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {group.essays.map((essay) => {
                const isOpen = openIds.has(essay.id);
                return (
                  <Card key={essay.id} outlined className="overflow-hidden">
                    {/* Accordion trigger */}
                    <button
                      onClick={() => toggle(essay.id)}
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="success" size="sm">
                            {essay.outcome}
                          </Badge>
                          <Badge variant="default" size="sm">
                            {essay.year}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            ~{essay.wordCount}{" "}
                            {lang === "zh" ? "词" : "words"}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-snug mt-2">
                          {lang === "zh" ? essay.promptZh : essay.prompt}
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
                        <div className="mt-4 mb-5 p-4 bg-indigo-50 rounded-xl">
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
                            {lang === "zh" ? "题目" : "Prompt"}
                          </p>
                          <p className="text-sm text-indigo-900 leading-relaxed">
                            {lang === "zh" ? essay.promptZh : essay.prompt}
                          </p>
                        </div>

                        {/* Language tabs inside essay */}
                        <div className="flex gap-1 mb-4">
                          {(["en", "zh"] as const).map((l) => (
                            <span
                              key={l}
                              className={clsx(
                                "px-3 py-1 text-xs rounded-lg font-medium",
                                lang === l
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-500"
                              )}
                            >
                              {l === "en" ? "EN" : "中文"}
                            </span>
                          ))}
                        </div>

                        {/* Essay body */}
                        <div className="prose prose-sm prose-slate max-w-none">
                          {(lang === "zh" ? essay.essayZh : essay.essay)
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
