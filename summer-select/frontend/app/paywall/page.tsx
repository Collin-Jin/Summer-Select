"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import { GraduationCap, CheckCircle2, XCircle, LogOut, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Lang = "en" | "zh";

const copy = {
  headline: { en: "Summer Select", zh: "Summer Select" },
  subtitle: {
    en: "Unlock the full directory and strategic analysis platform",
    zh: "解锁完整项目库与申请策略分析平台",
  },
  tableHeaders: {
    feature: { en: "Feature", zh: "功能" },
    free: { en: "Free", zh: "免费" },
    paid: { en: "Paid ✦", zh: "付费 ✦" },
  },
  freeFeatures: [
    { en: "Create an account", zh: "创建账户" },
    { en: "View basic program names", zh: "查看基础项目名称" },
  ],
  paidFeatures: [
    { en: "Full program directory (50+ programs)", zh: "完整项目库（50+ 个项目）" },
    { en: "Collin Index scores & rationale", zh: "Collin 指数评分与分析" },
    { en: "Application strategy guides", zh: "申请策略指南" },
    { en: "Bilingual content (EN / 中文)", zh: "中英双语内容" },
    { en: "Advanced search & filters", zh: "高级搜索与筛选" },
    { en: "Save programs to My List", zh: "收藏项目到我的列表" },
    { en: "Example essays (5 programs)", zh: "范文参考（5 个项目）" },
    { en: "Interview Q&A guides", zh: "面试问答指南" },
  ],
  ctaHeadline: { en: "Ready to get full access?", zh: "准备好获取完整访问权限了吗？" },
  ctaSubtitle: {
    en: "Contact us via WeChat or Instagram to subscribe and get your account upgraded instantly.",
    zh: "通过微信或 Instagram 联系我们订阅，立即升级您的账户。",
  },
  signOut: { en: "Sign out of this account", zh: "退出账户" },
  langToggle: { en: "中文", zh: "EN" },
};

/**
 * Upsell page shown to authenticated users whose `is_paid` flag is false.
 * Displays a feature comparison and contact details to upgrade.
 * Self-contained EN/ZH language toggle (outside the dashboard LanguageProvider).
 */
export default function PaywallPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "zh") setLang(stored);
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
    document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (obj: { en: string; zh: string }) => obj[lang];

  const handleLogout = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 relative">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="absolute right-0 top-0 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: "rgba(79,70,229,0.10)",
              color: "#4338ca",
              border: "1px solid rgba(79,70,229,0.2)",
            }}
          >
            {t(copy.langToggle)}
          </button>

          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 shadow-md mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {t(copy.headline)}
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            {t(copy.subtitle)}
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-6">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t(copy.tableHeaders.feature)}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              {t(copy.tableHeaders.free)}
            </div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider text-center">
              {t(copy.tableHeaders.paid)}
            </div>
          </div>

          {/* Free rows */}
          {copy.freeFeatures.map((f) => (
            <div
              key={f.en}
              className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0"
            >
              <div className="text-sm text-slate-700">{t(f)}</div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          ))}

          {/* Paid rows */}
          {copy.paidFeatures.map((f) => (
            <div
              key={f.en}
              className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0 bg-indigo-50/30"
            >
              <div className="text-sm text-slate-700">{t(f)}</div>
              <div className="flex justify-center">
                <XCircle className="h-4 w-4 text-slate-300" />
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white text-center mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">
            {t(copy.ctaHeadline)}
          </h2>
          <p className="text-indigo-200 text-sm mb-6">
            {t(copy.ctaSubtitle)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-xl px-5 py-3">
              <MessageCircle className="h-5 w-5 text-indigo-200" />
              <div className="text-left">
                <p className="text-xs text-indigo-300">{lang === "zh" ? "微信" : "WeChat"}</p>
                <p className="font-semibold text-sm">@summerselect</p>
              </div>
            </div>
            <a
              href="https://instagram.com/summerselectofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 rounded-xl px-5 py-3 hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-indigo-200" />
              <div className="text-left">
                <p className="text-xs text-indigo-300">Instagram</p>
                <p className="font-semibold text-sm">@summerselectofficial</p>
              </div>
            </a>
          </div>
        </div>

        {/* Sign out */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            <LogOut className="h-4 w-4" />
            {t(copy.signOut)}
          </Button>
        </div>
      </div>
    </div>
  );
}
