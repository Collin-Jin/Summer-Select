"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { removeFavorite } from "@/lib/favorites";
import type { SummerProgram, Lang } from "@/lib/database.types";

interface MyListClientViewProps {
  programs: SummerProgram[];
  lang: Lang;
}

/**
 * Client-side view for the My List page.
 * Manages the local list state so removing a favorite is reflected
 * instantly without a full page reload.
 */
export function MyListClientView({ programs, lang }: MyListClientViewProps) {
  const [visible, setVisible] = useState<Set<string>>(
    new Set(programs.map((p) => p.lid))
  );

  const handleToggleFavorite = async (programId: string, nowFavorited: boolean) => {
    if (!nowFavorited) {
      // Optimistic remove
      setVisible((prev) => {
        const next = new Set(prev);
        next.delete(programId);
        return next;
      });
      await removeFavorite(programId);
    }
  };

  const displayedPrograms = programs.filter((p) => visible.has(p.lid));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === "zh" ? "我的收藏" : "My List"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {displayedPrograms.length}{" "}
            {lang === "zh"
              ? "个已保存项目"
              : `saved program${displayedPrograms.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {displayedPrograms.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-10 w-10" />}
          title={lang === "zh" ? "暂无收藏" : "No saved programs yet"}
          description={
            lang === "zh"
              ? "在主页点击心形图标收藏项目"
              : "Tap the heart icon on any program card to save it here."
          }
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {lang === "zh" ? "浏览项目库" : "Browse programs"}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedPrograms.map((program) => (
            <ProgramCard
              key={program.lid}
              program={program}
              isFavorited={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
