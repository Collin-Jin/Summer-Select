"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import {
  GraduationCap, CheckCircle2, XCircle, LogOut, MessageCircle,
  ExternalLink, Award, ShieldCheck, Crosshair, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type Lang = "en" | "zh";

// ── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

// ── Credential badge ────────────────────────────────────────────────────────
function Cred({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className="inline-block mx-0.5 px-2 py-0.5 rounded-md text-xs font-bold align-middle whitespace-nowrap"
      style={
        gold
          ? { background: "#FFF3CC", color: "#92600A", border: "1px solid #FFD97D" }
          : { background: "#EEEEF7", color: "#3a3d6e", border: "1px solid #B8B8D1" }
      }
    >
      {children}
    </span>
  );
}

// ── Bilingual copy (existing compare table) ─────────────────────────────────
const copy = {
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
};

// ── Value prop data ─────────────────────────────────────────────────────────
const valueProps = [
  {
    icon: Award,
    title: "Built by an Insider",
    body: "Created by someone who actually walked the walk, got accepted, and coached others to do the same.",
    accent: "#5B5F97",
    bg: "#EEEEF7",
  },
  {
    icon: ShieldCheck,
    title: "Unmatched Quality Control",
    body: "Forget messy, AI-scraped lists with outdated links. Every single program is manually reviewed for accuracy.",
    accent: "#FF6B6C",
    bg: "#FFF0F0",
  },
  {
    icon: Crosshair,
    title: "Strategic Selection",
    body: "Find programs that fit your exact background — whether you're a seasoned researcher or a 9th grader looking for your first opportunity.",
    accent: "#FFC145",
    bg: "#FFF8EC",
  },
];

export default function PaywallPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "zh") setLang(stored as Lang);
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

  // Scroll-reveal refs
  const founder = useReveal();
  const stats = useReveal(0.1);
  const valueGrid = useReveal(0.08);
  const adCta = useReveal(0.15);

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFB" }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "var(--color-brand-500)", borderBottom: "1px solid var(--color-brand-600)" }}
      >
        <span
          className="text-sm font-extrabold uppercase tracking-widest"
          style={{ color: "#FFFFFB", fontFamily: "var(--font-syne, sans-serif)", letterSpacing: "0.1em" }}
        >
          Summer Select
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-3 py-1 text-xs font-bold rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFB", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            {lang === "en" ? "中" : "EN"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors"
            style={{ color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <LogOut className="h-3 w-3" />
            {t(copy.signOut)}
          </button>
        </div>
      </div>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 55%, #FFF8EC 100%)",
          minHeight: "80vh",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: "var(--color-brand-500)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "var(--color-brand-accent)" }}
        />

        {/* Floating icon */}
        <div
          className="animate-float mb-8 h-20 w-20 rounded-3xl flex items-center justify-center shadow-xl"
          style={{ background: "var(--color-brand-500)" }}
        >
          <GraduationCap className="h-10 w-10 text-white" />
        </div>

        {/* Headline — slide down & fade in */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-4xl"
          style={{
            color: "var(--color-brand-700)",
            fontFamily: "var(--font-syne, sans-serif)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-28px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          Unlock Your Dream{" "}
          <span style={{ color: "var(--color-brand-500)" }}>Summer Research Program</span>{" "}
          with{" "}
          <span
            className="relative inline-block"
            style={{ color: "var(--color-brand-accent)" }}
          >
            SUMMER SELECT
            <span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
              style={{ background: "var(--color-brand-accent)", opacity: 0.4 }}
            />
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="mt-6 text-lg sm:text-xl max-w-2xl leading-relaxed"
          style={{
            color: "#64748b",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-16px)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}
        >
          Applying to competitive summer programs shouldn&apos;t be a guessing game.
        </p>

        {/* Scroll hint */}
        <div
          className="animate-bounce-slow mt-16 flex flex-col items-center gap-1"
          style={{ color: "var(--color-brand-100)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* ── 2. FOUNDER STORY ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#FFFFFB" }}>
        <div className="max-w-4xl mx-auto">
          <div
            ref={founder.ref}
            className="relative rounded-3xl p-8 sm:p-12 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #EEEEF7 0%, #F8F7FD 100%)",
              border: "1px solid #B8B8D1",
              opacity: founder.visible ? 1 : 0,
              transform: founder.visible ? "translateX(0)" : "translateX(-48px)",
              transition: "opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-3xl"
              style={{ background: "linear-gradient(180deg, var(--color-brand-500), var(--color-brand-accent))" }}
            />

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar placeholder */}
              <div
                className="flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md"
                style={{ background: "var(--color-brand-500)", color: "#FFC145" }}
              >
                CJ
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-brand-500)" }}>
                  A Note from the Founder
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-slate-700">
                  Hi, I&apos;m <strong className="text-slate-900">Collin Jin</strong>. Just a couple of years ago, I was exactly where you are—DIYing my entire application process for summer programs and colleges. That hustle paid off: I became an alum of{" "}
                  <Cred gold>UCSB RMP</Cred> and <Cred gold>SRA</Cred>, got admitted to{" "}
                  <Cred>Harvey Mudd</Cred>, and am currently pursuing a dual degree in Electrical Engineering and Computer Science at{" "}
                  <Cred>Northwestern University&apos;s McCormick School of Engineering</Cred>.
                </p>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-700">
                  After figuring out the exact formula for standing out, I started mentoring students in the 2025–2026 application cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STATS BANNER ──────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            ref={stats.ref}
            className="text-center mb-12"
            style={{
              opacity: stats.visible ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-accent)" }}>
              Coaching Results
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              The results?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat 1 */}
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "1.25rem",
                padding: "2rem",
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(20px)",
                transition: "opacity 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
              }}
            >
              <div
                className="text-5xl font-black mb-3 leading-none"
                style={{ color: "var(--color-brand-accent)", fontFamily: "var(--font-syne, sans-serif)" }}
              >
                6
              </div>
              <p className="text-white font-semibold text-base leading-snug">
                UCSB RMP Acceptances
              </p>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                Including a 9th grader with <em>zero</em> prior research experience.
              </p>
            </div>

            {/* Stat 2 */}
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "1.25rem",
                padding: "2rem",
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(20px)",
                transition: "opacity 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.25s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.25s",
              }}
            >
              <div
                className="text-5xl font-black mb-3 leading-none"
                style={{ color: "var(--color-brand-rose)", fontFamily: "var(--font-syne, sans-serif)" }}
              >
                5+
              </div>
              <p className="text-white font-semibold text-base leading-snug">
                Elite Program Admissions
              </p>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                UCSB SRA, UCSC SIP, UChicago RIBS, The Summer Science Program, and Pioneer Academics.
              </p>
            </div>
          </div>

          {/* Closing line */}
          <div
            className="mt-10 text-center"
            style={{
              opacity: stats.visible ? 1 : 0,
              transition: "opacity 0.6s ease 0.45s",
            }}
          >
            <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              I achieved this while overloading my college schedule. But there are only so many hours in the day, and I want to help more ambitious students navigate this highly competitive landscape while keeping up with my own studies.{" "}
              <strong className="text-white">That&apos;s why I built SUMMER SELECT.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. VALUE PROP GRID ───────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#FFFFFB" }}>
        <div className="max-w-4xl mx-auto">
          <div
            ref={valueGrid.ref}
            className="text-center mb-12"
            style={{
              opacity: valueGrid.visible ? 1 : 0,
              transform: valueGrid.visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-500)" }}>
              Why SUMMER SELECT
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}
            >
              The ultimate database for ambitious students
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              SUMMER SELECT is the meticulously organized directory designed to streamline your summer application process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {valueProps.map(({ icon: Icon, title, body, accent, bg }, i) => (
              <div
                key={title}
                className="group rounded-2xl p-7 flex flex-col gap-4 cursor-default"
                style={{
                  background: "#fff",
                  border: "1px solid #E2E2EF",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  opacity: valueGrid.visible ? 1 : 0,
                  transform: valueGrid.visible ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.12}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.12}s, box-shadow 0.2s ease`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.1), 0 0 0 2px ${accent}33`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. AD CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{
          background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 100%)",
          borderTop: "1px solid #E2E2EF",
        }}
      >
        <div
          ref={adCta.ref}
          className="max-w-2xl mx-auto"
          style={{
            opacity: adCta.visible ? 1 : 0,
            transform: adCta.visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <p
            className="text-lg sm:text-xl leading-relaxed mb-10"
            style={{ color: "var(--color-brand-700)" }}
          >
            Stop stressing over where to find the right programs and start focusing on crafting the perfect application.{" "}
            <strong>Ready to level up your summer?</strong>
          </p>

          <button
            className="animate-cta-pulse inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "var(--color-brand-500)",
              color: "#FFFFFB",
            }}
            onClick={() => {
              document.getElementById("compare-table")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <GraduationCap className="h-5 w-5" />
            Discover your perfect fit on SUMMER SELECT today.
          </button>
        </div>
      </section>

      {/* ── COMPARE TABLE ────────────────────────────────────────────────── */}
      <div
        id="compare-table"
        className="px-4 pb-4 pt-16"
        style={{ background: "linear-gradient(to br, #f8fafc, #eef2ff)" }}
      >
        <div className="max-w-2xl mx-auto">

          {/* Section label */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-500)" }}>
              Pricing
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}>
              {lang === "zh" ? "免费 vs 付费" : "Free vs Paid"}
            </h2>
          </div>

          {/* Feature comparison table */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t(copy.tableHeaders.feature)}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                {t(copy.tableHeaders.free)}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--color-brand-500)" }}>
                {t(copy.tableHeaders.paid)}
              </div>
            </div>

            {copy.freeFeatures.map((f) => (
              <div key={f.en} className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0">
                <div className="text-sm text-slate-700">{t(f)}</div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
              </div>
            ))}

            {copy.paidFeatures.map((f) => (
              <div key={f.en} className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0" style={{ background: "#EEEEF750" }}>
                <div className="text-sm text-slate-700">{t(f)}</div>
                <div className="flex justify-center"><XCircle className="h-4 w-4 text-slate-300" /></div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} /></div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className="rounded-2xl p-8 text-white text-center mb-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)" }}
          >
            <h2 className="text-xl font-bold mb-2">{t(copy.ctaHeadline)}</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>{t(copy.ctaSubtitle)}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="flex items-center justify-center gap-2 rounded-xl px-5 py-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                <MessageCircle className="h-5 w-5" style={{ color: "rgba(255,255,255,0.7)" }} />
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{lang === "zh" ? "微信" : "WeChat"}</p>
                  <p className="font-semibold text-sm">@summerselect</p>
                </div>
              </div>
              <a
                href="https://instagram.com/summerselectofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
              >
                <ExternalLink className="h-5 w-5" style={{ color: "rgba(255,255,255,0.7)" }} />
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Instagram</p>
                  <p className="font-semibold text-sm">@summerselectofficial</p>
                </div>
              </a>
            </div>
          </div>

          {/* Sign out */}
          <div className="text-center pb-12">
            <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-slate-600 text-sm">
              <LogOut className="h-4 w-4" />
              {t(copy.signOut)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
