"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, GraduationCap } from "lucide-react";
import { Badge, deadlineTierVariant, categoryVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CollinIndexBadge } from "./CollinIndexBadge";
import { FavoriteButton } from "./FavoriteButton";
import { getDeadlineLabel } from "@/utils/formatDate";
import { formatCost } from "@/utils/formatFinancial";
import { useLanguage } from "@/context/LanguageContext";
import type { SummerProgram } from "@/lib/database.types";

interface ProgramCardProps {
  program: SummerProgram;
  isFavorited: boolean;
  onToggleFavorite: (programId: string, nowFavorited: boolean) => void;
}

/**
 * Card component displaying a program summary in the dashboard grid and My List page.
 *
 * Displays:
 * - Program name (bilingual), host institution, location
 * - Category badge, format, duration
 * - Deadline urgency badge
 * - Tuition cost
 * - Collin Index score
 * - Favorite toggle button
 *
 * Clicking the card navigates to `/dashboard/program/[slug]`.
 */
export function ProgramCard({
  program,
  isFavorited,
  onToggleFavorite,
}: ProgramCardProps) {
  const { t, lang } = useLanguage();

  const name = (program[t("name") as keyof SummerProgram] as string) || program.name_en;
  const institution =
    (program[t("host_institution") as keyof SummerProgram] as string | null) ||
    program.host_institution_en;
  const city =
    (program[t("location_city") as keyof SummerProgram] as string | null) ||
    program.location_city_en;
  const category =
    (program[t("primary_category") as keyof SummerProgram] as string | null) ||
    program.primary_category_en;
  const format =
    (program[t("format") as keyof SummerProgram] as string | null) ||
    program.format_en;

  const deadline = program.regular_deadline || program.priority_deadline;
  const deadlineInfo = getDeadlineLabel(deadline);
  const location = [city, program.location_state].filter(Boolean).join(", ");

  return (
    <Card hoverable className="group overflow-hidden flex flex-col animate-fade-in-up">
      <Link
        href={`/dashboard/program/${program.slug}`}
        className="flex flex-col flex-1 p-5"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo or fallback icon */}
            {program.logo_url ? (
              <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100">
                <Image
                  src={program.logo_url}
                  alt={`${name} logo`}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            ) : (
              <div
                className="h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-brand-50)" }}
              >
                <GraduationCap className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 transition-colors duration-150 group-hover:[color:var(--color-brand-600)]">
                {name}
              </h3>
              {institution && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {institution}
                </p>
              )}
            </div>
          </div>

          {/* Favorite + Collin index */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <CollinIndexBadge score={program.collin_rec_index} variant="compact" />
            <FavoriteButton
              programId={program.lid}
              initialFavorited={isFavorited}
              onToggle={(nowFavorited) =>
                onToggleFavorite(program.lid, nowFavorited)
              }
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {category && (
            <Badge variant={categoryVariant(category)} size="sm">
              {category}
            </Badge>
          )}
          {format && (
            <Badge variant="outline" size="sm">
              {format}
            </Badge>
          )}
          {program.is_rolling_admission && (
            <Badge variant="info" size="sm">
              {lang === "zh" ? "滚动录取" : "Rolling"}
            </Badge>
          )}
          {program.financial_aid_available && (
            <Badge variant="success" size="sm">
              {lang === "zh" ? "奖学金" : "Aid"}
            </Badge>
          )}
          {program.is_paid_stipend && (
            <Badge variant="purple" size="sm">
              {lang === "zh" ? "有补贴" : "Stipend"}
            </Badge>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-col gap-1 text-xs text-slate-500 mt-auto pt-3 border-t border-slate-50">
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {program.duration_weeks && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span>
                {program.duration_weeks}{" "}
                {lang === "zh" ? "周" : `week${program.duration_weeks !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
          {program.acceptance_rate !== null && program.acceptance_rate !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span>
                ~{Math.round(program.acceptance_rate <= 1 ? program.acceptance_rate * 100 : program.acceptance_rate)}%{" "}
                {lang === "zh" ? "录取率" : "acceptance"}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Footer: deadline + cost */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div>
          {deadlineInfo ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">
                {lang === "zh" ? "截止" : "Deadline"}:
              </span>
              <Badge variant={deadlineTierVariant(deadlineInfo.tier)} size="sm">
                {deadlineInfo.label}
              </Badge>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              {lang === "zh" ? "截止日期待定" : "Deadline TBD"}
            </span>
          )}
        </div>
        <div className="text-right">
          {program.tuition_cost !== null && program.tuition_cost !== undefined ? (
            <span className="text-xs font-semibold text-slate-700">
              {formatCost(program.tuition_cost)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </div>
    </Card>
  );
}
