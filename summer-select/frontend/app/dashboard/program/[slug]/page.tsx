import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProgramBySlug } from "@/lib/programs";
import { cookies } from "next/headers";
import type { Lang, SummerProgram } from "@/lib/database.types";
import { Badge, categoryVariant } from "@/components/ui/Badge";
import { Card, CardDivider } from "@/components/ui/Card";
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
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
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
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "返回项目库" : "Back to directory"}
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Card className="p-6 mb-6">
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
            <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <span className="text-2xl font-bold text-indigo-400">
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
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
              {format && <Badge variant="outline">{format}</Badge>}
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
                <Badge
                  variant={
                    deadlineInfo.tier === "closed"
                      ? "danger"
                      : deadlineInfo.tier === "urgent"
                      ? "danger"
                      : deadlineInfo.tier === "soon"
                      ? "warning"
                      : "success"
                  }
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {deadlineInfo.label}
                </Badge>
              )}
              {program.is_rolling_admission && (
                <Badge variant="info">
                  {lang === "zh" ? "滚动录取" : "Rolling Admission"}
                </Badge>
              )}
              {program.financial_aid_available && (
                <Badge variant="success">
                  {lang === "zh" ? "提供奖学金" : "Financial Aid"}
                </Badge>
              )}
              {program.is_paid_stipend && (
                <Badge variant="purple">
                  {lang === "zh" ? "提供补贴" : "Paid Stipend"}
                </Badge>
              )}
              {program.international_eligible && (
                <Badge variant="info">
                  <Globe className="h-3 w-3 mr-1" />
                  {lang === "zh" ? "国际生可申请" : "International OK"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 3 data sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Admissions Timeline */}
          <Card className="p-6">
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
          <Card className="p-6">
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

          {/* Requirements */}
          <Card className="p-6">
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
                <p className="text-xs font-medium text-slate-500 mb-2">
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
            <Card className="p-6">
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

        {/* Right column: Collin Index */}
        <div className="space-y-6">
          <Card className="p-6 border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white">
            <SectionHeader title="Collin Index" />

            {/* Gauge */}
            <div className="flex justify-center mb-6">
              <CollinIndexBadge score={program.collin_rec_index} variant="full" />
            </div>

            {/* Difficulty level */}
            {difficultyLevel && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {lang === "zh" ? "难度等级" : "Difficulty"}
                </p>
                <Badge variant="warning" size="md">
                  {difficultyLevel}
                </Badge>
              </div>
            )}

            <CardDivider className="my-4" />

            {/* Rationale */}
            {rationale && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === "zh" ? "Collin 的评价" : "Collin's Analysis"}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {rationale}
                </p>
              </div>
            )}

            {/* Strategy */}
            {strategy && (
              <>
                <CardDivider className="my-4" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {lang === "zh" ? "申请策略" : "Application Strategy"}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {strategy}
                  </p>
                </div>
              </>
            )}

            {!rationale && !strategy && (
              <p className="text-sm text-slate-400 italic text-center py-4">
                {lang === "zh" ? "分析内容即将上线" : "Analysis coming soon"}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
