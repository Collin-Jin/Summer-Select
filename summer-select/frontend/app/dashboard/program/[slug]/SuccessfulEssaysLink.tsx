import Link from "next/link";
import { ArrowRight, Lock, PenLine } from "lucide-react";
import type { ProgramEssaySummary } from "@/lib/programs";
import type { Lang } from "@/lib/database.types";

/**
 * Points to the successful example essays for this program. Shown to everyone
 * (only the counts are public); the essays page itself is members-only, so
 * readers without access are told so and the link leads to the upgrade prompt.
 */
export function SuccessfulEssaysLink({
  lang,
  slug,
  summary,
  canRead,
}: {
  lang: Lang;
  slug: string;
  summary: ProgramEssaySummary;
  canRead: boolean;
}) {
  const zh = lang === "zh";
  const { essayCount, promptCount } = summary;

  const title = zh ? "成功案例范文" : "Successful essays";
  const detail = zh
    ? `${essayCount} 篇被录取的真实范文，涵盖 ${promptCount} 个题目`
    : `${essayCount} accepted ${essayCount === 1 ? "essay" : "essays"} across ${promptCount} ${
        promptCount === 1 ? "prompt" : "prompts"
      }`;
  const cta = canRead ? (zh ? "查看范文" : "Read the essays") : zh ? "解锁范文" : "Unlock the essays";

  return (
    <Link
      href={`/dashboard/essays?program=${encodeURIComponent(slug)}`}
      className="group mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--color-brand-200)] hover:shadow-md sm:flex-row sm:items-center animate-fade-in-up delay-200"
    >
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--color-brand-50)" }}
      >
        <PenLine className="h-6 w-6" style={{ color: "var(--color-brand-600)" }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{detail}</p>
        {!canRead && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Lock className="h-3 w-3" aria-hidden />
            {zh ? "仅限会员" : "Members only"}
          </p>
        )}
      </div>
      <span
        className="inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition group-hover:opacity-90 sm:self-center"
        style={{ background: "var(--color-brand-600)" }}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
