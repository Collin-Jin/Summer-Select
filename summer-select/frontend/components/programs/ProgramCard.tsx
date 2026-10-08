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
import { EditButton, DraftBadge } from "@/components/admin/inline/EditControls";
import type { SummerProgram } from "@/lib/database.types";
import type { ViewerAccess } from "@/lib/access";

interface ProgramCardProps {
  program: SummerProgram;
  isFavorited: boolean;
  onToggleFavorite: (programId: string, nowFavorited: boolean) => void;
  access?: ViewerAccess;
}

export function ProgramCard({
  program,
  isFavorited,
  onToggleFavorite,
  access = "paid",
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

  const acceptanceRate =
    program.acceptance_rate !== null && program.acceptance_rate !== undefined
      ? Math.round(
          program.acceptance_rate <= 1
            ? program.acceptance_rate * 100
            : program.acceptance_rate
        )
      : null;

  // Build a compact inline stats string
  const statParts: React.ReactNode[] = [];
  if (location) {
    statParts.push(
      <span key="loc" className="flex items-center gap-1">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        {location}
      </span>
    );
  }
  if (program.duration_weeks) {
    statParts.push(
      <span key="dur" className="flex items-center gap-1">
        <Clock className="h-3 w-3 flex-shrink-0" />
        {program.duration_weeks}{lang === "zh" ? "周" : `w`}
      </span>
    );
  }
  if (acceptanceRate !== null) {
    statParts.push(
      <span key="acc" className="flex items-center gap-1">
        <Users className="h-3 w-3 flex-shrink-0" />
        ~{acceptanceRate}%
      </span>
    );
  }

  return (
    <Card hoverable className="group overflow-hidden flex flex-col animate-fade-in-up">
      <Link
        href={`/dashboard/program/${program.slug}`}
        className="flex flex-col flex-1 p-5"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
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

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:[color:var(--color-brand-600)] transition-colors duration-150">
              {name}
            </h3>
            {institution && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{institution}</p>
            )}
          </div>

          {/* Collin Index + Favorite — side by side */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CollinIndexBadge score={program.collin_rec_index} variant="compact" />
            <FavoriteButton
              programId={program.lid}
              initialFavorited={isFavorited}
              access={access}
              onToggle={(nowFavorited) => onToggleFavorite(program.lid, nowFavorited)}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <DraftBadge published={program.is_published} />
          {category && (
            <Badge variant={categoryVariant(category)} size="sm">{category}</Badge>
          )}
          {format && (
            <Badge variant="format" size="sm">{format}</Badge>
          )}
          {program.is_rolling_admission && (
            <Badge variant="coral" size="sm">
              {lang === "zh" ? "滚动录取" : "Rolling"}
            </Badge>
          )}
          {program.financial_aid_available && (
            <Badge variant="gold" size="sm">
              {lang === "zh" ? "奖学金" : "Aid"}
            </Badge>
          )}
          {program.is_paid_stipend && (
            <Badge variant="gold" size="sm">
              {lang === "zh" ? "有补贴" : "Stipend"}
            </Badge>
          )}
        </div>

        {/* Stats — single inline row with dot separators */}
        {statParts.length > 0 && (
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
            {statParts.map((part, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {part}
                {i < statParts.length - 1 && (
                  <span className="text-slate-200 select-none">·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Footer: deadline + cost */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          {deadlineInfo ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">
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
        <EditButton resource="programs" id={program.lid} label={`Edit ${name}`} />
        <div>
          {program.tuition_cost !== null && program.tuition_cost !== undefined ? (
            <span className="text-sm font-semibold text-slate-700">
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
