"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  ArrowLeft,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WatermarkedContent } from "@/components/ui/WatermarkedContent";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import type { SummerProgramPromptWithEssays } from "@/lib/database.types";
import type { EmptyProgram, ProgramDescription } from "./page";
import { saveArrangement } from "@/app/admin/actions";
import { useAdmin } from "@/components/admin/inline/AdminProvider";
import { AddButton, DraftBadge, EditButton } from "@/components/admin/inline/EditControls";
import { SortableList } from "@/components/admin/inline/SortableList";
import { clsx } from "clsx";

interface ProgramGroup {
  /** Same as programSlug; lets the group be used in a sortable list. */
  id: string;
  programSlug: string;
  programName: string;
  prompts: SummerProgramPromptWithEssays[];
}

function buildProgramGroups(prompts: SummerProgramPromptWithEssays[]): ProgramGroup[] {
  const programMap = new Map<string, ProgramGroup>();
  for (const prompt of prompts) {
    const { program_slug } = prompt;
    if (!programMap.has(program_slug)) {
      const firstName = prompt.program_example_essays[0]?.program_name ?? program_slug;
      programMap.set(program_slug, { id: program_slug, programSlug: program_slug, programName: firstName, prompts: [] });
    }
    programMap.get(program_slug)!.prompts.push(prompt);
  }
  return Array.from(programMap.values());
}

// ── Program selection grid ────────────────────────────────────────────────────

function ProgramCard({
  group,
  desc,
  lang,
  onSelect,
  handle,
}: {
  group: ProgramGroup;
  desc: ProgramDescription | undefined;
  lang: "en" | "zh";
  onSelect: () => void;
  handle?: React.ReactNode;
}) {
  const { editing } = useAdmin();
  const essayCount = group.prompts.reduce((s, p) => s + p.program_example_essays.length, 0);
  const promptCount = group.prompts.length;
  const displayName = desc
    ? lang === "zh" && desc.name_zh
      ? desc.name_zh
      : desc.name_en
    : group.programName;
  const about =
    desc && (desc.collin_rationale_en || desc.collin_rationale_zh)
      ? lang === "zh" && desc.collin_rationale_zh
        ? desc.collin_rationale_zh
        : desc.collin_rationale_en
      : null;

  return (
    <div className="relative">
    <button
      onClick={onSelect}
      className="group text-left w-full rounded-2xl overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "#FFFFFB",
        border: "1.5px solid var(--color-brand-100)",
        boxShadow: "0 2px 12px rgba(91,95,151,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 8px 32px rgba(91,95,151,0.18)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--color-brand-300)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 2px 12px rgba(91,95,151,0.07)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--color-brand-100)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {/* Colored top stripe */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-brand-400) 0%, var(--color-brand-600) 100%)",
        }}
      />

      <div className="px-5 pt-5 pb-5">
        {/* Program name */}
        <h3
          className={clsx("font-bold text-base leading-snug mb-2", editing ? "pr-24" : "pr-6")}
          style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}
        >
          {displayName}
        </h3>

        {/* About snippet */}
        {about && (
          <p
            className="text-xs leading-relaxed mb-4 line-clamp-2"
            style={{ color: "#64748b" }}
          >
            {about}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}
          >
            <FileText className="h-3 w-3" />
            {lang === "zh"
              ? `${essayCount} 篇文书`
              : `${essayCount} essay${essayCount !== 1 ? "s" : ""}`}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "#F1F5F9", color: "#475569" }}
          >
            {lang === "zh"
              ? `${promptCount} 道题目`
              : `${promptCount} prompt${promptCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* CTA row */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--color-brand-50)" }}
        >
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-brand-500)" }}
          >
            {lang === "zh" ? "浏览范文" : "Browse Essays"}
          </span>
          <span
            className="flex items-center justify-center h-6 w-6 rounded-full transition-transform group-hover:translate-x-0.5"
            style={{ background: "var(--color-brand-100)" }}
          >
            <ChevronRight
              className="h-3.5 w-3.5"
              style={{ color: "var(--color-brand-600)" }}
            />
          </span>
        </div>
      </div>
    </button>
    {editing && (
      <div className="absolute right-3 top-4 z-10 flex items-center gap-1.5">
        {handle}
        {desc && <EditButton resource="programs" id={desc.lid} label={`Edit ${displayName}`} />}
      </div>
    )}
    </div>
  );
}

// ── Essays detail view ────────────────────────────────────────────────────────

function ProgramEssaysView({
  group,
  desc,
  lang,
  userEmail,
  onBack,
  onReorderPrompts,
}: {
  group: ProgramGroup;
  desc: ProgramDescription | undefined;
  lang: "en" | "zh";
  userEmail: string | null;
  onBack: () => void;
  onReorderPrompts: (next: SummerProgramPromptWithEssays[]) => void;
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

  const displayName = desc
    ? lang === "zh" && desc.name_zh
      ? desc.name_zh
      : desc.name_en
    : group.programName;

  const essayCount = group.prompts.reduce((s, p) => s + p.program_example_essays.length, 0);

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
            background:
              "linear-gradient(135deg, #3a3d6e 0%, var(--color-brand-500) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-xl font-extrabold leading-snug"
                style={{
                  color: "#FFFFFB",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  <FileText className="h-3 w-3" />
                  {lang === "zh"
                    ? `${essayCount} 篇文书`
                    : `${essayCount} essay${essayCount !== 1 ? "s" : ""}`}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {lang === "zh"
                    ? `${group.prompts.length} 道题目`
                    : `${group.prompts.length} prompt${group.prompts.length !== 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {desc && <EditButton resource="programs" id={desc.lid} label={`Edit ${displayName}`} />}
              <Link
                href={`/dashboard/program/${group.programSlug}`}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
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
        </div>

        {/* About section */}
        {desc && (desc.collin_rationale_en || desc.collin_rationale_zh) && (
          <div className="px-6 py-4" style={{ background: "var(--color-brand-50)" }}>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-brand-500)" }}
            >
              {lang === "zh" ? "项目简介" : "About this Program"}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-brand-700)" }}
            >
              {lang === "zh" && desc.collin_rationale_zh
                ? desc.collin_rationale_zh
                : desc.collin_rationale_en}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p
        className="text-sm rounded-xl px-4 py-3 border mb-6"
        style={{ background: "#FFF8EC", borderColor: "#FFE4A0", color: "#92600A" }}
      >
        {lang === "zh"
          ? "这些文书来自真实的成功申请者，用于学习写作结构和风格，请勿抄袭。内容受版权保护，禁止复制或传播。"
          : "These essays are from real successful applicants and are provided for structural and stylistic reference only. Do not plagiarize. Content is protected — copying or sharing is prohibited."}
      </p>

      {/* Prompts + essays */}
      <SortableList
        items={group.prompts}
        layout="list"
        className="space-y-8"
        onReorder={onReorderPrompts}
        renderItem={(prompt, promptIdx, handle) => (
          <div>
            {/* Prompt header */}
            <div
              className="mb-3 px-4 py-3 rounded-xl border flex items-start gap-3"
              style={{ background: "#F8F7FD", borderColor: "var(--color-brand-100)" }}
            >
              {handle}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-brand-500)" }}
                >
                  {lang === "zh" ? `题目 ${promptIdx + 1}` : `Prompt ${promptIdx + 1}`}
                </p>
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: "var(--color-brand-700)" }}
                >
                  {lang === "zh" && prompt.prompt_zh ? prompt.prompt_zh : prompt.prompt_en}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <DraftBadge published={prompt.is_published} />
                <EditButton resource="prompts" id={prompt.id} label="Edit prompt" />
              </div>
            </div>

            {/* Essay accordions */}
            <div className="space-y-3 pl-2">
              {[...prompt.program_example_essays]
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((essay, essayIdx) => {
                  const isOpen = openIds.has(essay.id);
                  return (
                    <Card key={essay.id} outlined className="relative overflow-hidden">
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
                              <Badge variant="success" size="sm">{essay.outcome}</Badge>
                            )}
                            {essay.year && (
                              <Badge variant="default" size="sm">{essay.year}</Badge>
                            )}
                            <DraftBadge published={essay.is_published} />
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                      <EditButton
                        resource="essays"
                        id={essay.id}
                        label="Edit example essay"
                        className="absolute right-12 top-2 z-10"
                      />

                      {isOpen && (
                        <div className="px-5 pb-6 border-t border-slate-100">
                          <div className="flex gap-1 my-4">
                            <span
                              className="px-3 py-1 text-xs rounded-lg font-medium"
                              style={{ background: "var(--color-brand-500)", color: "#fff" }}
                            >
                              EN
                            </span>
                          </div>
                          <WatermarkedContent userEmail={userEmail}>
                            <div className="prose prose-sm prose-slate max-w-none">
                              {essay.essay.split("\n\n").map((para, i) => (
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
              <AddButton
                resource="essays"
                presets={{ prompt_id: prompt.id }}
                label="Add example essay"
              />
            </div>
          </div>
        )}
      />
      <AddButton
        resource="prompts"
        presets={{ program_slug: group.programSlug }}
        label="Add essay prompt"
        className="mt-8"
      />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EssaysClientView({
  prompts: serverPrompts,
  programDescriptions,
  emptyPrograms = [],
  userEmail,
}: {
  prompts: SummerProgramPromptWithEssays[];
  programDescriptions: Record<string, ProgramDescription>;
  /** Edit mode only: directory programs that have no prompts yet. */
  emptyPrograms?: EmptyProgram[];
  userEmail: string | null;
}) {
  const { lang } = useLanguage();
  const router = useRouter();
  const { notify, editing } = useAdmin();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [, startSaving] = useTransition();

  // Local copy so drag-and-drop feels instant; resynced whenever the server sends new data.
  const [prompts, setPrompts] = useState(serverPrompts);
  const [seenServerPrompts, setSeenServerPrompts] = useState(serverPrompts);
  if (seenServerPrompts !== serverPrompts) {
    setSeenServerPrompts(serverPrompts);
    setPrompts(serverPrompts);
  }

  const groups = buildProgramGroups(prompts);

  /** Shows the new order immediately, saves it, and rolls back if saving fails. */
  function persistOrder(next: SummerProgramPromptWithEssays[]) {
    const previous = prompts;
    setPrompts(next);
    const arrangement = buildProgramGroups(next).map((g) => ({
      id: g.programSlug,
      itemIds: g.prompts.map((p) => p.id),
    }));
    startSaving(async () => {
      try {
        const res = await saveArrangement("essays", arrangement);
        if (!res.ok) {
          setPrompts(previous);
          notify(res.error ?? "Could not save the new order.", false);
          return;
        }
        notify("Order saved.");
        router.refresh();
      } catch {
        setPrompts(previous);
        notify("Couldn't reach the server. The order was not saved.", false);
      }
    });
  }

  const reorderPrograms = (next: ProgramGroup[]) => persistOrder(next.flatMap((g) => g.prompts));
  const reorderPrompts = (slug: string, nextPrompts: SummerProgramPromptWithEssays[]) =>
    persistOrder(groups.flatMap((g) => (g.programSlug === slug ? nextPrompts : g.prompts)));
  const grandTotalEssays = prompts.reduce((s, p) => s + p.program_example_essays.length, 0);

  const selectedGroup = selectedSlug
    ? (groups.find((g) => g.programSlug === selectedSlug) ?? null)
    : null;

  // ── Program detail view ──
  if (selectedGroup) {
    return (
      <ProgramEssaysView
        group={selectedGroup}
        desc={programDescriptions[selectedGroup.programSlug]}
        lang={lang}
        userEmail={userEmail}
        onBack={() => setSelectedSlug(null)}
        onReorderPrompts={(next) => reorderPrompts(selectedGroup.programSlug, next)}
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
            style={{ background: "var(--color-brand-100)" }}
          >
            <BookOpen className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-brand-600)" }}>
              {lang === "zh" ? "范文参考" : "Example Essays"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === "zh"
                ? `${grandTotalEssays} 篇文书 · ${groups.length} 个项目`
                : `${grandTotalEssays} essays across ${groups.length} programs`}
            </p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <p
          className="text-sm rounded-xl px-4 py-3 border"
          style={{ background: "#FFF8EC", borderColor: "#FFE4A0", color: "#92600A" }}
        >
          {lang === "zh"
            ? "这些文书来自真实的成功申请者，用于学习写作结构和风格，请勿抄袭。内容受版权保护，禁止复制或传播。"
            : "These essays are from real successful applicants and are provided for structural and stylistic reference only. Do not plagiarize. Content is protected — copying or sharing is prohibited."}
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
      <SortableList
        items={groups}
        layout="grid"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onReorder={reorderPrograms}
        renderItem={(group, _i, handle) => (
          <ProgramCard
            group={group}
            desc={programDescriptions[group.programSlug]}
            lang={lang}
            onSelect={() => setSelectedSlug(group.programSlug)}
            handle={handle}
          />
        )}
      />
      <AddButton resource="programs" label="Add program" className="mt-5" />

      {/* Edit mode: programs that exist but don't have any essay prompts yet. */}
      {editing && emptyPrograms.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Programs without essays yet
            </p>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emptyPrograms.map((p) => (
              <li
                key={p.lid}
                className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{p.name_en}</p>
                  <DraftBadge published={p.is_published} />
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <AddButton
                    resource="prompts"
                    presets={{ program_slug: p.slug }}
                    label="Add first prompt"
                    className="!px-3 !py-1.5"
                  />
                  <EditButton resource="programs" id={p.lid} label={`Edit ${p.name_en}`} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
