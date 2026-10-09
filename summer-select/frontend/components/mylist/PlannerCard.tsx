"use client";

import Link from "next/link";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { FavoriteButton } from "@/components/programs/FavoriteButton";
import { CollinIndexBadge } from "@/components/programs/CollinIndexBadge";
import { formatCost } from "@/lib/format/financial";
import {
  STATUS_META,
  STATUS_ORDER,
  URGENCY_COLORS,
  daysBetween,
  parseDate,
  isStatusDone,
  urgencyOf,
} from "@/lib/planner";
import type { FavoritePatch } from "@/lib/favorites";
import type { FavoriteStatus, Lang } from "@/lib/database.types";
import { StarRating } from "./StarRating";
import { NotesEditor } from "./NotesEditor";
import {
  formatDay,
  programInstitution,
  programName,
  relativeDays,
  type Copy,
} from "./copy";
import type { SavedEntry } from "./types";

interface PlannerCardProps {
  entry: SavedEntry;
  today: Date;
  copy: Copy;
  lang: Lang;
  /** Saves a change; resolves to false when it could not be saved. */
  onSave: (programId: string, patch: FavoritePatch) => Promise<boolean>;
  /** Called after the heart is toggled (and rolled back on failure). */
  onToggle: (programId: string, nowFavorited: boolean) => void;
}

/** One saved program: dates, rating, application status and private notes. */
export function PlannerCard({ entry, today, copy, lang, onSave, onToggle }: PlannerCardProps) {
  const { program } = entry;
  const name = programName(program, lang);
  const institution = programInstitution(program, lang);
  const done = isStatusDone(entry.status);
  const meta = STATUS_META[entry.status];

  const dates = [
    { kind: "opens" as const, value: program.application_open_date },
    { kind: "priority" as const, value: program.priority_deadline },
    { kind: "regular" as const, value: program.regular_deadline },
  ]
    .map((d) => ({ ...d, date: parseDate(d.value) }))
    .filter((d): d is { kind: "opens" | "priority" | "regular"; value: string | null; date: Date } =>
      d.date !== null
    );

  const costParts = [
    program.application_fee !== null &&
      `${copy.fee}: ${program.application_fee === 0 ? copy.free : formatCost(program.application_fee)}`,
    program.tuition_cost !== null && `${copy.cost}: ${formatCost(program.tuition_cost)}`,
  ].filter((part): part is string => typeof part === "string");

  return (
    <article
      id={`program-${program.lid}`}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md animate-fade-in-up"
    >
      <div className="h-1" style={{ background: meta.color, opacity: 0.8 }} />
      <div className="space-y-5 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          {program.logo_url ? (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100">
              <Image
                src={program.logo_url}
                alt=""
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
          ) : (
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--color-brand-50)" }}
            >
              <GraduationCap className="h-6 w-6" style={{ color: "var(--color-brand-500)" }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/program/${program.slug}`}
              className="block text-base font-bold leading-snug text-slate-900 transition-colors hover:[color:var(--color-brand-600)]"
            >
              {name}
            </Link>
            {institution && <p className="mt-0.5 truncate text-sm text-slate-500">{institution}</p>}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <CollinIndexBadge score={program.collin_rec_index} variant="compact" />
            <FavoriteButton
              programId={program.lid}
              initialFavorited
              programName={name}
              onToggle={(now) => onToggle(program.lid, now)}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap gap-2">
          {dates.map(({ kind, date }) => {
            const days = daysBetween(today, date);
            const urgency = urgencyOf(days);
            const isOpen = kind === "opens";
            const colors = isOpen || done ? URGENCY_COLORS.passed : URGENCY_COLORS[urgency];
            return (
              <span
                key={kind}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
                style={{ color: isOpen || done ? "#475569" : colors.fg, background: isOpen || done ? "#F1F5F9" : colors.bg }}
              >
                <span className="font-semibold">{copy.kind[kind]}</span>
                <span>{formatDay(date, lang, { month: "short", day: "numeric", year: "numeric" })}</span>
                {!isOpen && !done && <span className="font-bold">· {urgency === "passed" ? copy.passed : relativeDays(days, copy)}</span>}
              </span>
            );
          })}
          {dates.length === 0 && (
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
              {program.is_rolling_admission ? copy.rolling : copy.tbd}
            </span>
          )}
          {program.is_rolling_admission && dates.length > 0 && (
            <span className="inline-flex items-center rounded-lg bg-[#FF6B6C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#B42318]">
              {copy.rolling}
            </span>
          )}
          {costParts.length > 0 && (
            <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
              {costParts.join(" · ")}
            </span>
          )}
        </div>

        {/* Rating + status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.rating}</p>
            <div className="flex flex-wrap items-center gap-x-3">
              <StarRating
                value={entry.rating}
                onChange={(rating) => void onSave(program.lid, { rating })}
                ariaLabel={copy.rateAria}
                groupLabel={copy.rating}
              />
              <span className="text-sm text-slate-500">
                {entry.rating ? copy.ratingWords[entry.rating - 1] : copy.notRated}
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor={`status-${program.lid}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {copy.status}
            </label>
            <select
              id={`status-${program.lid}`}
              value={entry.status}
              onChange={(e) => void onSave(program.lid, { status: e.target.value as FavoriteStatus })}
              className="w-full rounded-xl border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30"
              style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}33` }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {lang === "zh" ? STATUS_META[s].zh : STATUS_META[s].en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <NotesEditor
          initialValue={entry.notes}
          onSave={(notes) => onSave(program.lid, { notes })}
          copy={copy}
        />
      </div>
    </article>
  );
}

