import Link from "next/link";
import { Lock } from "lucide-react";
import { signinUrl, signupUrl } from "@/lib/access";
import type { Lang } from "@/lib/database.types";

/**
 * What guests see in place of Collin's analysis: invented sample text under a
 * blur, with a prompt to sign up. The real analysis is never sent to guests
 * (the database hides it from them), so the blurred text is purely decorative.
 */
export function AnalysisTeaser({ lang, slug }: { lang: Lang; slug: string }) {
  const next = `/dashboard/program/${slug}`;
  const zh = lang === "zh";

  return (
    <div className="relative rounded-xl overflow-hidden min-h-[15rem]">
      <div aria-hidden className="select-none pointer-events-none blur-[6px] space-y-4 px-1 py-1 min-h-[15rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(184,184,209,0.9)" }}>
            {zh ? "Collin 的评价" : "Collin's Analysis"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
            A selective program with a strong research reputation. Admits tend to show genuine curiosity and a concrete
            project rather than a long list of activities, and past cohorts skew toward students with some prior
            exposure to the field.
          </p>
        </div>
        <div className="pt-4" style={{ borderTop: "1px solid rgba(184,184,209,0.25)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(184,184,209,0.9)" }}>
            {zh ? "申请策略" : "Application Strategy"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
            Lead with one specific question you have explored, tie it to what this program teaches, and use the short
            answers to show range. Apply before the priority deadline and ask your recommender early.
          </p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-3" style={{ background: "rgba(58,61,110,0.35)" }}>
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl"
          style={{ border: "1px solid #E4E4F0" }}
        >
          <div
            className="mx-auto mb-3 h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "#FFF3CC" }}
          >
            <Lock className="h-5 w-5" style={{ color: "#92600A" }} />
          </div>
          <p className="text-sm font-extrabold" style={{ color: "#3a3d6e" }}>
            {zh ? "注册后即可阅读 Collin 的分析与申请策略" : "Sign up to read Collin's analysis and strategy"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {zh ? "免费账户即可解锁，并可使用“我的列表”。" : "Free accounts unlock it, plus My List."}
          </p>
          <div className="mt-4 flex gap-2.5">
            <Link
              href={signupUrl(next)}
              className="flex-1 rounded-lg px-4 py-2.5 text-xs font-bold transition-transform hover:scale-[1.03]"
              style={{ background: "#5B5F97", color: "#FFFFFB" }}
            >
              {zh ? "免费注册" : "Sign up free"}
            </Link>
            <Link
              href={signinUrl(next)}
              className="flex-1 rounded-lg border px-4 py-2.5 text-xs font-bold transition-transform hover:scale-[1.03]"
              style={{ borderColor: "#B8B8D1", color: "#4E527F" }}
            >
              {zh ? "登录" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
