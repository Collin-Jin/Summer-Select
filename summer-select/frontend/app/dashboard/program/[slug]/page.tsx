import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProgramBySlug } from "@/lib/programs";
import { cookies } from "next/headers";
import type { Lang, SummerProgram } from "@/lib/database.types";
import { Badge, categoryVariant, deadlineTierVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CollinIndexBadge } from "@/components/programs/CollinIndexBadge";
import { ProgramDetailFavoriteButton } from "./ProgramDetailFavoriteButton";
import {
  formatProgramDate,
  formatDateRange,
  getDeadlineLabel,
} from "@/utils/formatDate";
import {
  formatCost,
  formatAppFee,
  formatStipend,
  formatAcceptanceRate,
  formatGpa,
  formatEligibleGrades,
} from "@/utils/formatFinancial";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program Not Found" };
  return {
    title: program.name_en,
    description: program.collin_rationale_en ?? undefined,
  };
}

// ── Helper sub-components ──────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        <div className="text-sm text-slate-800 font-medium">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ fontFamily: "var(--font-syne, sans-serif)", color: "var(--color-brand-500)", letterSpacing: "0.14em" }}
    >
      {title}
    </h2>
  );
}

function BooleanIndicator({ value, trueLabel, falseLabel }: { value: boolean | null; trueLabel: string; falseLabel: string }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-400">—</span>;
  }
  return value ? (
    <span className="flex items-center gap-1 text-emerald-600">
      <CheckCircle2 className="h-4 w-4" />
      {trueLabel}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-slate-400">
      <XCircle className="h-4 w-4" />
      {falseLabel}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

/**
 * Program Detail Page — Server Component.
 *
 * Renders all 7 schema sections for a single program:
 *   1. Identity & Branding (header)
 *   2. Admissions Timeline
 *   3. Financials
 *   4. Requirements & Selectivity
 *   5. The "Collin Index" (featured section)
 *   6. Disciplines
 *   7. Essay & Interview requirements
 *
 * Language is read from the `lang` cookie so bilingual fields render correctly.
 */
export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) notFound();

  const cookieStore = await cookies();
  const rawLang = cookieStore.get("lang")?.value;
  const lang: Lang = rawLang === "en" || rawLang === "zh" ? rawLang : "en";

  /**
   * Returns the language-suffixed field value for a bilingual base column name.
   * Falls back to the English value if the localised one is null.
   */
  const l = (base: string): string | null => {
    const localised = program[`${base}_${lang}` as keyof SummerProgram] as string | null | undefined;
    const fallback = program[`${base}_en` as keyof SummerProgram] as string | null | undefined;
    return localised ?? fallback ?? null;
  };

  const name = l("name") ?? program.name_en;
  const institution = l("host_institution");
  const city = l("location_city");
  const category = l("primary_category");
  const format = l("format");
  const difficultyLevel = l("difficulty_level");
  const rationale = l("collin_rationale");
  const strategy = l("collin_strategy");
  const essaysText = l("essays_required");
  const disciplines = (
    lang === "zh"
      ? program.offered_disciplines_zh
      : program.offered_disciplines_en
  ) ?? program.offered_disciplines_en;

  const location = [city, program.location_state].filter(Boolean).join(", ");
  const deadline = program.regular_deadline || program.priority_deadline;
  const deadlineInfo = getDeadlineLabel(deadline);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:[color:var(--color-brand-500)] mb-6 transition-colors duration-150 animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "返回项目库" : "Back to directory"}
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Card className="p-6 mb-6 animate-fade-in-up delay-75 border-t-[3px] [border-top-color:var(--color-brand-500)]">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Logo */}
          {program.logo_url ? (
            <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <Image
                src={program.logo_url}
                alt={`${name} logo`}
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
          ) : (
            <div
              className="h-16 w-16 flex-shrink-0 rounded-xl flex items-center justify-center border"
              style={{ background: "var(--color-brand-50)", borderColor: "var(--color-brand-100)" }}
            >
              <span className="text-2xl font-bold" style={{ color: "var(--color-brand-500)" }}>
                {name.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                  {name}
                </h1>
                {institution && (
                  <p className="text-base text-slate-500 mt-1">{institution}</p>
                )}
                {location && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <ProgramDetailFavoriteButton programId={program.lid} />
                {program.program_url && (
                  <a
                    href={program.program_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
                    style={{ background: "var(--color-brand-500)" }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {lang === "zh" ? "官网" : "Apply"}
                  </a>
                )}
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {category && (
                <Badge variant={categoryVariant(category)}>{category}</Badge>
              )}
              {format && <Badge variant="format">{format}</Badge>}
              {program.duration_weeks && (
                <Badge variant="default">
                  <Clock className="h-3 w-3 mr-1" />
                  {program.duration_weeks}{" "}
                  {lang === "zh"
                    ? "周"
                    : `wk${program.duration_weeks !== 1 ? "s" : ""}`}
                </Badge>
              )}
              {deadlineInfo && (
                <Badge variant={deadlineTierVariant(deadlineInfo.tier)}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {deadlineInfo.label}
                </Badge>
              )}
              {program.is_rolling_admission && (
                <Badge variant="coral">
                  {lang === "zh" ? "滚动录取" : "Rolling Admission"}
                </Badge>
              )}
              {program.financial_aid_available && (
                <Badge variant="gold">
                  {lang === "zh" ? "提供奖学金" : "Financial Aid"}
                </Badge>
              )}
              {program.is_paid_stipend && (
                <Badge variant="gold">
                  {lang === "zh" ? "提供补贴" : "Paid Stipend"}
                </Badge>
              )}
              {program.international_eligible && (
                <Badge variant="rose">
                  <Globe className="h-3 w-3 mr-1" />
                  {lang === "zh" ? "国际生可申请" : "International OK"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Collin Recommendation Card (hero section) ───────────────────────── */}
      <div
        className="rounded-2xl p-6 mb-6 animate-fade-in-up delay-150"
        style={{
          background: "linear-gradient(135deg, #5B5F97 0%, #3a3d6e 100%)",
          boxShadow: "0 8px 32px rgba(91,95,151,0.35)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#FFC145", letterSpacing: "0.18em" }}
            >
              {lang === "zh" ? "Collin 推荐指数" : "Collin Recommendation Index"}
            </p>
            <h2 className="text-lg font-bold text-white">
              {lang === "zh" ? "专属申请分析" : "Proprietary Application Analysis"}
            </h2>
          </div>
          {difficultyLevel && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFB" }}
            >
              {difficultyLevel}
            </span>
          )}
        </div>

        {/* Score + content grid */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Score gauge */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-6 py-4"
            style={{ background: "rgba(255,255,255,0.12)", minWidth: "130px" }}
          >
            <CollinIndexBadge score={program.collin_rec_index} variant="full" />
          </div>

          {/* Analysis text */}
          <div className="flex-1 min-w-0 space-y-4">
            {rationale && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(184,184,209,0.9)" }}
                >
                  {lang === "zh" ? "Collin 的评价" : "Collin's Analysis"}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {rationale}
                </p>
              </div>
            )}
            {strategy && (
              <div
                className="pt-4"
                style={{ borderTop: "1px solid rgba(184,184,209,0.25)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(184,184,209,0.9)" }}
                >
                  {lang === "zh" ? "申请策略" : "Application Strategy"}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {strategy}
                </p>
              </div>
            )}
            {!rationale && !strategy && (
              <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.5)" }}>
                {lang === "zh" ? "分析内容即将上线" : "Analysis coming soon"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Data grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT column: Admissions Timeline + Financials */}
        <div className="flex flex-col gap-6 animate-fade-in-up delay-200">
          {/* Admissions Timeline */}
          <Card className="p-6 border-l-[3px] [border-left-color:var(--color-brand-accent)]">
            <SectionHeader title={lang === "zh" ? "申请时间线" : "Admissions Timeline"} />
            <DetailRow icon={Calendar} label={lang === "zh" ? "申请开放" : "Application Opens"} value={formatProgramDate(program.application_open_date)} />
            <DetailRow
              icon={AlertCircle}
              label={lang === "zh" ? "优先截止" : "Priority Deadline"}
              value={
                program.priority_deadline
                  ? formatProgramDate(program.priority_deadline)
                  : "—"
              }
            />
            <DetailRow
              icon={Calendar}
              label={lang === "zh" ? "最终截止" : "Regular Deadline"}
              value={
                program.regular_deadline
                  ? formatProgramDate(program.regular_deadline)
                  : "—"
              }
            />
            <DetailRow
              icon={Clock}
              label={lang === "zh" ? "项目日期" : "Program Dates"}
              value={formatDateRange(program.program_start_date, program.program_end_date)}
            />
            <DetailRow
              icon={CheckCircle2}
              label={lang === "zh" ? "滚动录取" : "Rolling Admission"}
              value={
                <BooleanIndicator
                  value={program.is_rolling_admission}
                  trueLabel={lang === "zh" ? "是" : "Yes"}
                  falseLabel={lang === "zh" ? "否" : "No"}
                />
              }
            />
          </Card>

          {/* Financials */}
          <Card className="p-6 border-l-[3px] [border-left-color:var(--color-brand-500)]">
            <SectionHeader title={lang === "zh" ? "费用与奖学金" : "Financials"} />
            <DetailRow
              icon={DollarSign}
              label={lang === "zh" ? "项目学费" : "Tuition"}
              value={formatCost(program.tuition_cost)}
            />
            <DetailRow
              icon={DollarSign}
              label={lang === "zh" ? "申请费" : "Application Fee"}
              value={formatAppFee(program.application_fee)}
            />
            <DetailRow
              icon={CheckCircle2}
              label={lang === "zh" ? "奖学金/助学金" : "Financial Aid"}
              value={
                <BooleanIndicator
                  value={program.financial_aid_available}
                  trueLabel={lang === "zh" ? "可申请" : "Available"}
                  falseLabel={lang === "zh" ? "不提供" : "Not available"}
                />
              }
            />
            <DetailRow
              icon={DollarSign}
              label={lang === "zh" ? "参与补贴" : "Student Stipend"}
              value={formatStipend(program.is_paid_stipend, program.stipend_amount)}
            />
          </Card>
        </div>

        {/* RIGHT column: Requirements & Selectivity + Disciplines */}
        <div className="flex flex-col gap-6 animate-fade-in-up delay-300">
          {/* Requirements */}
          <Card className="p-6 border-l-[3px] [border-left-color:var(--color-brand-coral)]">
            <SectionHeader title={lang === "zh" ? "申请条件" : "Requirements & Selectivity"} />
            <DetailRow
              icon={Users}
              label={lang === "zh" ? "适用年级" : "Eligible Grades"}
              value={formatEligibleGrades(program.eligible_grades)}
            />
            <DetailRow
              icon={Globe}
              label={lang === "zh" ? "国际生" : "International Students"}
              value={
                <BooleanIndicator
                  value={program.international_eligible}
                  trueLabel={lang === "zh" ? "可申请" : "Eligible"}
                  falseLabel={lang === "zh" ? "不可申请" : "Not eligible"}
                />
              }
            />
            <DetailRow
              icon={BookOpen}
              label={lang === "zh" ? "最低GPA" : "Minimum GPA"}
              value={formatGpa(program.minimum_gpa)}
            />
            <DetailRow
              icon={Users}
              label={lang === "zh" ? "录取率" : "Acceptance Rate"}
              value={
                program.acceptance_rate !== null && program.acceptance_rate !== undefined
                  ? formatAcceptanceRate(program.acceptance_rate)
                  : "—"
              }
            />
            <DetailRow
              icon={BookOpen}
              label={lang === "zh" ? "需要文书" : "Essay Required"}
              value={
                <BooleanIndicator
                  value={program.requires_essay}
                  trueLabel={lang === "zh" ? "需要" : "Yes"}
                  falseLabel={lang === "zh" ? "不需要" : "No"}
                />
              }
            />
            <DetailRow
              icon={Users}
              label={lang === "zh" ? "需要面试" : "Interview Required"}
              value={
                <BooleanIndicator
                  value={program.has_interview}
                  trueLabel={lang === "zh" ? "需要" : "Yes"}
                  falseLabel={lang === "zh" ? "不需要" : "No"}
                />
              }
            />

            {/* Essay prompts */}
            {essaysText && (
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-xs font-medium text-slate-600 mb-2">
                  {lang === "zh" ? "文书题目" : "Essay Prompts"}
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {essaysText}
                </p>
              </div>
            )}
          </Card>

          {/* Disciplines */}
          {disciplines && disciplines.length > 0 && (
            <Card className="p-6 border-l-[3px] [border-left-color:var(--color-brand-rose)]">
              <SectionHeader title={lang === "zh" ? "研究方向" : "Offered Disciplines"} />
              <div className="flex flex-wrap gap-2">
                {disciplines.map((d) => (
                  <Badge key={d} variant="default" size="md">
                    {d}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
