"use client";

import Link from "next/link";
import { Camera, Check, Copy, Lock, Mail, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CONTACT } from "@/lib/contact";
import { signinUrl, signupUrl, type ViewerAccess } from "@/lib/access";
import { EssaysPreview, EvaluatePreview, InterviewsPreview } from "./LockedPreviews";

export type LockedFeatureKey = "essays" | "evaluate" | "interviews";

const FEATURES: Record<
  LockedFeatureKey,
  {
    Preview: () => React.JSX.Element;
    name: { en: string; zh: string };
    pitch: { en: string; zh: string };
  }
> = {
  essays: {
    Preview: EssaysPreview,
    name: { en: "Example Essays", zh: "范文" },
    pitch: {
      en: "60+ real example essays across 30 prompts, so you can see what a strong answer looks like.",
      zh: "涵盖 30 个题目的 60+ 篇真实范文，让你看清优秀答案的样子。",
    },
  },
  evaluate: {
    Preview: EvaluatePreview,
    name: { en: "Essay Evaluator", zh: "文书评估" },
    pitch: {
      en: "Paste your draft and get instant feedback grounded in the example essays.",
      zh: "粘贴你的草稿，立即获得基于范文库的反馈。",
    },
  },
  interviews: {
    Preview: InterviewsPreview,
    name: { en: "Interview Prep", zh: "面试准备" },
    pitch: {
      en: "75+ interview questions with guidance on how to answer them.",
      zh: "75+ 道面试题，附带回答思路。",
    },
  },
};

/**
 * A blurred look at a members-only page with a prompt on top. Guests are asked
 * to sign up or sign in; free accounts are asked to upgrade (by contacting
 * Collin). The page content behind the blur is decorative sample content.
 */
export function LockedFeature({
  feature,
  access,
  nextPath,
}: {
  feature: LockedFeatureKey;
  access: ViewerAccess;
  /** Where to return after signing in. */
  nextPath: string;
}) {
  const { lang } = useLanguage();
  const t = (b: { en: string; zh: string }) => b[lang];
  const { Preview, name, pitch } = FEATURES[feature];
  const isGuest = access === "guest";

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[calc(100vh-10rem)]" style={{ background: "#F8F8FC", border: "1px solid #E4E4F0" }}>
      {/* Blurred, non-interactive preview */}
      <div
        aria-hidden
        inert
        className="pointer-events-none select-none blur-[7px] opacity-90 scale-[1.02] origin-top max-h-[calc(100vh-10rem)] overflow-hidden"
      >
        <Preview />
      </div>

      {/* Tint so the card stands out */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,251,0.35), rgba(238,238,247,0.75))" }} />

      <div className="absolute inset-0 flex items-start sm:items-center justify-center px-4 pt-10 sm:pt-0">
        <div
          role="dialog"
          aria-label={t(name)}
          className="animate-pop-in w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl"
          style={{ border: "1px solid #E4E4F0" }}
        >
          <div
            className="mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#5B5F97,#3a3d6e)" }}
          >
            <Lock className="h-6 w-6 text-white" />
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3"
            style={{ background: "#FFF3CC", color: "#92600A" }}
          >
            <Sparkles className="h-3 w-3" />
            {lang === "zh" ? "完整会员专享" : "Full access"}
          </span>

          <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#3a3d6e", fontFamily: "var(--font-syne, sans-serif)" }}>
            {t(name)}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{t(pitch)}</p>

          {isGuest ? (
            <GuestActions nextPath={nextPath} />
          ) : (
            <UpgradeActions />
          )}
        </div>
      </div>
    </div>
  );
}

function GuestActions({ nextPath }: { nextPath: string }) {
  const { lang } = useLanguage();
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={signupUrl(nextPath)}
          className="flex-1 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: "#5B5F97", color: "#FFFFFB" }}
        >
          {lang === "zh" ? "免费注册" : "Sign up free"}
        </Link>
        <Link
          href={signinUrl(nextPath)}
          className="flex-1 inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-95"
          style={{ borderColor: "#B8B8D1", color: "#4E527F", background: "#FFFFFB" }}
        >
          {lang === "zh" ? "登录" : "Sign in"}
        </Link>
      </div>
      <p className="mt-4 text-xs text-slate-400 leading-relaxed">
        {lang === "zh"
          ? "免费账户即可查看 Collin 的项目分析并使用“我的列表”。完整权限请联系 Collin 升级。"
          : "A free account unlocks Collin's program analysis and My List. Message Collin to upgrade for full access."}
      </p>
    </>
  );
}

function UpgradeActions() {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* Clipboard blocked: the value is still shown on the page. */
    }
  };

  const row = "flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left";
  const rowStyle = { background: "#F8F7FD", border: "1px solid #E8E7F5" } as const;
  const smallBtn =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-transform hover:scale-105 active:scale-95 shrink-0";

  return (
    <>
      <p className="text-sm font-semibold mb-3" style={{ color: "#3a3d6e" }}>
        {lang === "zh"
          ? "联系 Collin 升级你的账户："
          : "Message Collin to upgrade your account:"}
      </p>
      <div className="space-y-2">
        <div className={row} style={rowStyle}>
          <span className="flex items-center gap-2.5 min-w-0">
            <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#07C160" }} />
            <span className="min-w-0">
              <span className="block text-[11px] text-slate-400">{lang === "zh" ? "微信" : "WeChat"}</span>
              <span className="block text-sm font-bold text-slate-800 truncate">{CONTACT.wechat}</span>
            </span>
          </span>
          <button type="button" onClick={() => copy("wechat", CONTACT.wechat)} className={smallBtn} style={{ background: copied === "wechat" ? "#FFC145" : "#EEEEF7", color: "#3a3d6e" }}>
            {copied === "wechat" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "wechat" ? (lang === "zh" ? "已复制" : "Copied") : lang === "zh" ? "复制" : "Copy"}
          </button>
        </div>

        <div className={row} style={rowStyle}>
          <span className="flex items-center gap-2.5 min-w-0">
            <Camera className="h-4 w-4 shrink-0" style={{ color: "#FF6B6C" }} />
            <span className="min-w-0">
              <span className="block text-[11px] text-slate-400">Instagram</span>
              <span className="block text-sm font-bold text-slate-800 truncate">@{CONTACT.instagram}</span>
            </span>
          </span>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className={smallBtn} style={{ background: "#EEEEF7", color: "#3a3d6e" }}>
            {lang === "zh" ? "打开" : "Open"}
          </a>
        </div>

        <div className={row} style={rowStyle}>
          <span className="flex items-center gap-2.5 min-w-0">
            <Mail className="h-4 w-4 shrink-0" style={{ color: "#5B5F97" }} />
            <span className="min-w-0">
              <span className="block text-[11px] text-slate-400">{lang === "zh" ? "邮箱" : "Email"}</span>
              <span className="block text-xs sm:text-sm font-bold text-slate-800 break-all">{CONTACT.email}</span>
            </span>
          </span>
          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("SUMMER SELECT full access")}`}
            className={smallBtn}
            style={{ background: "#FFC145", color: "#3a3d6e" }}
          >
            {lang === "zh" ? "发邮件" : "Email"}
          </a>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        {lang === "zh" ? "联系时请附上你的注册邮箱。" : "Include the email you signed up with."}
      </p>
    </>
  );
}
