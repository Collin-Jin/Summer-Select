"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";

export interface ProgramFilters {
  search: string;
  category: string;
  format: string;
  grade: string;
  financialAid: boolean;
  stipend: boolean;
  international: boolean;
  sortBy: "collin_index" | "deadline" | "tuition_asc" | "acceptance";
}

export const DEFAULT_FILTERS: ProgramFilters = {
  search: "",
  category: "",
  format: "",
  grade: "",
  financialAid: false,
  stipend: false,
  international: false,
  sortBy: "collin_index",
};

interface FilterPanelProps {
  filters: ProgramFilters;
  onChange: (filters: ProgramFilters) => void;
  categories: string[];
  formats: string[];
  totalCount: number;
  filteredCount: number;
}

const GRADE_OPTIONS = ["9", "10", "11", "12"];
const SORT_OPTIONS: { value: ProgramFilters["sortBy"]; label: string; labelZh: string }[] = [
  { value: "collin_index", label: "Collin Index", labelZh: "Collin评分" },
  { value: "deadline", label: "Deadline", labelZh: "截止日期" },
  { value: "tuition_asc", label: "Cost (Low → High)", labelZh: "费用(低→高)" },
  { value: "acceptance", label: "Acceptance Rate", labelZh: "录取率" },
];

/**
 * Sidebar filter panel for the main dashboard.
 * Manages all search, filter, and sort state via the `onChange` callback.
 * All labels are bilingual based on the active language from LanguageContext.
 */
export function FilterPanel({
  filters,
  onChange,
  categories,
  formats,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const { lang } = useLanguage();

  const set = <K extends keyof ProgramFilters>(key: K, value: ProgramFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const resetAll = () => onChange(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.category ||
    filters.format ||
    filters.grade ||
    filters.financialAid ||
    filters.stipend ||
    filters.international;

  return (
    <div className="w-full space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {lang === "zh" ? "搜索" : "Search"}
        </label>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder={lang === "zh" ? "搜索项目名称…" : "Search programs…"}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {lang === "zh" ? "排序方式" : "Sort By"}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value as ProgramFilters["sortBy"])}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {lang === "zh" ? opt.labelZh : opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {lang === "zh" ? "类别" : "Category"}
          </label>
          <select
            value={filters.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">{lang === "zh" ? "全部类别" : "All categories"}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Format */}
      {formats.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {lang === "zh" ? "形式" : "Format"}
          </label>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => set("format", filters.format === f ? "" : f)}
                className={clsx(
                  "px-3 py-1 text-xs rounded-full border font-medium transition-colors",
                  filters.format === f
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grade */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {lang === "zh" ? "年级" : "Grade"}
        </label>
        <div className="flex gap-2">
          {GRADE_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => set("grade", filters.grade === g ? "" : g)}
              className={clsx(
                "flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors",
                filters.grade === g
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              )}
            >
              {lang === "zh" ? `${g}年级` : `G${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle filters */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {lang === "zh" ? "特殊条件" : "Attributes"}
        </label>
        <div className="space-y-2">
          {[
            { key: "financialAid" as const, label: "Financial Aid Available", labelZh: "提供奖学金" },
            { key: "stipend" as const, label: "Paid Stipend", labelZh: "提供补贴" },
            { key: "international" as const, label: "International Eligible", labelZh: "国际生可申请" },
          ].map(({ key, label, labelZh }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {lang === "zh" ? labelZh : label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Results count + reset */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filteredCount} / {totalCount}{" "}
            {lang === "zh" ? "个项目" : "programs"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              {lang === "zh" ? "清除筛选" : "Clear filters"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Displays active filter chips above the grid for quick removal */
export function ActiveFilterChips({
  filters,
  onChange,
}: {
  filters: ProgramFilters;
  onChange: (f: ProgramFilters) => void;
}) {
  const { lang } = useLanguage();
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.category) {
    chips.push({ label: filters.category, onRemove: () => onChange({ ...filters, category: "" }) });
  }
  if (filters.format) {
    chips.push({ label: filters.format, onRemove: () => onChange({ ...filters, format: "" }) });
  }
  if (filters.grade) {
    chips.push({
      label: lang === "zh" ? `${filters.grade}年级` : `Grade ${filters.grade}`,
      onRemove: () => onChange({ ...filters, grade: "" }),
    });
  }
  if (filters.financialAid) {
    chips.push({
      label: lang === "zh" ? "奖学金" : "Financial Aid",
      onRemove: () => onChange({ ...filters, financialAid: false }),
    });
  }
  if (filters.stipend) {
    chips.push({
      label: lang === "zh" ? "补贴" : "Stipend",
      onRemove: () => onChange({ ...filters, stipend: false }),
    });
  }
  if (filters.international) {
    chips.push({
      label: lang === "zh" ? "国际生" : "International",
      onRemove: () => onChange({ ...filters, international: false }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <SlidersHorizontal className="h-4 w-4 text-slate-400 mt-0.5" />
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={chip.onRemove}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
