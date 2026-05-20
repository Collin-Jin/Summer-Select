"use client";

import { useState, useEffect, useMemo } from "react";
import { ProgramCard } from "./ProgramCard";
import { FilterPanel, ActiveFilterChips, DEFAULT_FILTERS } from "./FilterPanel";
import type { ProgramFilters } from "./FilterPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { fetchFavorites, addFavorite, removeFavorite } from "@/lib/favorites";
import { useLanguage } from "@/context/LanguageContext";
import type { SummerProgram } from "@/lib/database.types";
import { Search, LayoutGrid } from "lucide-react";

interface ProgramsClientViewProps {
  programs: SummerProgram[];
  categories: string[];
  formats: string[];
}

/**
 * Client-side view for the main dashboard.
 * Receives all programs from the Server Component parent and handles:
 * - Filtering by category, format, grade, attributes
 * - Sorting by Collin Index, deadline, cost, acceptance rate
 * - Full-text search against the name and institution fields
 * - Favorites state loaded from Supabase on mount, with optimistic updates
 */
export function ProgramsClientView({
  programs,
  categories,
  formats,
}: ProgramsClientViewProps) {
  const { t, lang } = useLanguage();
  const [filters, setFilters] = useState<ProgramFilters>(DEFAULT_FILTERS);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    fetchFavorites().then((favs) => {
      setFavoritedIds(new Set(favs.map((f) => f.program_id)));
      setFavoritesLoading(false);
    });
  }, []);

  const handleToggleFavorite = (programId: string, nowFavorited: boolean) => {
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (nowFavorited) next.add(programId);
      else next.delete(programId);
      return next;
    });
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = programs;

    // Full-text search on name + institution (both languages)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) =>
        [p.name_en, p.name_zh, p.host_institution_en, p.host_institution_zh]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(q))
      );
    }

    if (filters.category) {
      result = result.filter(
        (p) =>
          p.primary_category_en === filters.category ||
          p.primary_category_zh === filters.category
      );
    }

    if (filters.format) {
      result = result.filter(
        (p) => p.format_en === filters.format || p.format_zh === filters.format
      );
    }

    if (filters.grade) {
      const g = parseInt(filters.grade, 10);
      result = result.filter((p) => p.eligible_grades?.includes(g) ?? false);
    }

    if (filters.financialAid) {
      result = result.filter((p) => p.financial_aid_available === true);
    }

    if (filters.stipend) {
      result = result.filter((p) => p.is_paid_stipend === true);
    }

    if (filters.international) {
      result = result.filter((p) => p.international_eligible === true);
    }

    return result;
  }, [programs, filters]);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (filters.sortBy) {
      case "collin_index":
        return arr.sort(
          (a, b) => (b.collin_rec_index ?? 0) - (a.collin_rec_index ?? 0)
        );
      case "deadline": {
        const toMs = (d: string | null) =>
          d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;
        return arr.sort(
          (a, b) =>
            toMs(a.regular_deadline || a.priority_deadline) -
            toMs(b.regular_deadline || b.priority_deadline)
        );
      }
      case "tuition_asc":
        return arr.sort(
          (a, b) => (a.tuition_cost ?? 0) - (b.tuition_cost ?? 0)
        );
      case "acceptance":
        return arr.sort(
          (a, b) =>
            (a.acceptance_rate ?? 1) - (b.acceptance_rate ?? 1)
        );
      default:
        return arr;
    }
  }, [filtered, filters.sortBy]);

  return (
    <div className="flex gap-8">
      {/* Sidebar filters — desktop */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-24">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            categories={categories}
            formats={formats}
            totalCount={programs.length}
            filteredCount={sorted.length}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar: mobile filter toggle + result count */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1
              className="text-2xl font-bold text-slate-800 leading-normal overflow-visible"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              {lang === "zh" ? "项目库" : "Program Directory"}
            </h1>
            <div
              className="mt-1 h-0.5 w-12 rounded-full"
              style={{ background: "var(--color-brand-accent)" }}
            />
          </div>
          <button
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors duration-150"
            style={{ borderColor: "var(--color-brand-100)", color: "var(--color-brand-600)" }}
            onClick={() => setMobileFiltersOpen((o) => !o)}
          >
            <LayoutGrid className="h-4 w-4" />
            {lang === "zh" ? "筛选" : "Filter"}
          </button>
        </div>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              categories={categories}
              formats={formats}
              totalCount={programs.length}
              filteredCount={sorted.length}
            />
          </div>
        )}

        {/* Active filter chips */}
        <ActiveFilterChips filters={filters} onChange={setFilters} />

        {/* Results */}
        {favoritesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<Search className="h-10 w-10" />}
            title={
              lang === "zh" ? "未找到相关项目" : "No programs match your filters"
            }
            description={
              lang === "zh"
                ? "请尝试清除筛选条件"
                : "Try adjusting or clearing your filters to see more results."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {sorted.map((program) => (
              <ProgramCard
                key={program.lid}
                program={program}
                isFavorited={favoritedIds.has(program.lid)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
