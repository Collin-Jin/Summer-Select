"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import Image from "next/image";
import {
  GraduationCap, CheckCircle2, XCircle, LogOut,
  MessageCircle, ExternalLink, Award, ShieldCheck,
  Crosshair, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type Lang = "en" | "zh";

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-reveal hook — fires once when element enters viewport
// ─────────────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12, rootMargin = "0px 0px -80px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// Count-up hook — animates 0 → target with ease-out cubic when triggered
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    setValue(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter hook — reveals text char by char, variable speed, blinking cursor
// ─────────────────────────────────────────────────────────────────────────────
function useTypewriter(text: string, trigger: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      if (i >= text.length) { setDone(true); return; }
      i++;
      setDisplayed(text.slice(0, i));
      const ch = text[i - 1];
      const delay = /[.!?。！？]/.test(ch) ? speed * 12
        : /[,;:，；：]/.test(ch)            ? speed * 5
        : /[\s]/.test(ch)                   ? speed * 1.5
        : speed + Math.random() * speed * 0.4;
      timer = setTimeout(type, delay);
    };

    timer = setTimeout(type, 400);
    return () => clearTimeout(timer);
  }, [trigger, text, speed]);

  return { displayed, done };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline credential badge
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Full bilingual copy
// ─────────────────────────────────────────────────────────────────────────────
const copy = {
  // Navbar
  signOutShort: { en: "Sign out", zh: "退出" },

  // Hero
  heroEyebrow: { en: "The #1 Summer Program Platform", zh: "顶尖暑期项目平台" },
  heroH1a:     { en: "Unlock Your Dream", zh: "解锁你的梦想" },
  heroH1b:     { en: "Summer Research Program", zh: "暑期科研项目" },
  heroH1c:     { en: "with SUMMER SELECT", zh: "· SUMMER SELECT" },
  heroSub:     {
    en: "Applying to competitive summer programs shouldn't be a guessing game.",
    zh: "申请竞争激烈的暑期项目，不应该是一场猜谜游戏。",
  },
  heroScroll:  { en: "Scroll", zh: "向下" },

  // Founder
  founderEyebrow: { en: "A Note from the Founder", zh: "创始人寄语" },
  founderP1: {
    en: "Hi, I'm Collin Jin. Just a couple of years ago, I was exactly where you are—DIYing my entire application process for summer programs and colleges. That hustle paid off: I became an alum of UCSB RMP and SRA, got admitted to Harvey Mudd, and am currently pursuing a dual degree in Electrical Engineering and Computer Science at Northwestern University's McCormick School of Engineering.",
    zh: "大家好，我是 Collin Jin。就在几年前，我和你一样——自己摸索着申请暑期项目和大学的全流程。那段努力没有白费：我成为了 UCSB RMP 和 SRA 的校友，被 Harvey Mudd 录取，目前正在西北大学麦考密克工程学院攻读电气工程与计算机科学双学位。",
  },
  founderP2: {
    en: "After figuring out the exact formula for standing out, I started mentoring students in the 2025–2026 application cycle.",
    zh: "在摸索出一套脱颖而出的方法论后，我开始在 2025–2026 申请季为学生提供指导。",
  },

  // Stats
  statsEyebrow:  { en: "Coaching Results", zh: "辅导成果" },
  statsH2:       { en: "The results?", zh: "成果如何？" },
  stat1Title:    { en: "UCSB RMP Acceptances", zh: "UCSB RMP 录取" },
  stat1Body:     { en: "Including a 9th grader with zero prior research experience!", zh: "包括一位零研究经验的 9 年级学生！" },
  stat2Title:    { en: "Elite Program Admissions", zh: "顶尖项目录取" },
  stat2Body:     { en: "UCSB SRA, UCSC SIP, UChicago RIBS, The Summer Science Program, and Pioneer Academics.", zh: "UCSB SRA、UCSC SIP、UChicago RIBS、暑期科学项目及 Pioneer Academics。" },
  stat3Title:    { en: "Students Mentored", zh: "辅导学生人数" },
  stat3Body:     { en: "And counting — across all grade levels and research backgrounds.", zh: "持续增长中——涵盖所有年级与科研背景的学生。" },
  statsClosing:  {
    en: "I achieved this while overloading my college schedule. But there are only so many hours in the day—I want to help more ambitious students navigate this competitive landscape. That's why I built SUMMER SELECT.",
    zh: "这一切都是在我本科课业繁重的情况下完成的。但一天的时间毕竟有限——我希望帮助更多有志向的学生在竞争激烈的赛道上找到方向。这就是我打造 SUMMER SELECT 的初衷。",
  },

  // Value props
  valueEyebrow: { en: "Why SUMMER SELECT", zh: "为何选择 SUMMER SELECT" },
  valueH2:      { en: "The ultimate database for ambitious students", zh: "专为上进学生打造的终极数据库" },
  valueSub:     {
    en: "SUMMER SELECT is the meticulously organized directory designed to streamline your summer application process.",
    zh: "SUMMER SELECT 是专为简化暑期申请流程而精心整理的项目数据库。",
  },

  // CTA section
  ctaBody: {
    en: "Stop stressing over where to find the right programs and start focusing on crafting the perfect application. Ready to level up your summer?",
    zh: "不再为寻找合适项目而焦虑，专注打磨每一份申请材料。准备好让你的暑假焕然一新了吗？",
  },
  ctaBtn: {
    en: "Discover your perfect fit on SUMMER SELECT today.",
    zh: "立即在 SUMMER SELECT 上发现最适合你的项目。",
  },

  // Compare table
  tableEyebrow: { en: "Pricing", zh: "定价" },
  tableH2:      { en: "Free vs Paid", zh: "免费 vs 付费" },
  tableHeaders: {
    feature: { en: "Feature", zh: "功能" },
    free:    { en: "Free", zh: "免费" },
    paid:    { en: "Paid ✦", zh: "付费 ✦" },
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
  contactH2:     { en: "Ready to get full access?", zh: "准备好获取完整访问权限了吗？" },
  contactSub:    {
    en: "Contact us via WeChat or Instagram to subscribe and get your account upgraded instantly.",
    zh: "通过微信或 Instagram 联系我们订阅，立即升级您的账户。",
  },
  wechatLabel:   { en: "WeChat", zh: "微信" },
  signOutFull:   { en: "Sign out of this account", zh: "退出账户" },
};

// Value prop card data (bilingual)
const valueCards = [
  {
    icon: Award,
    title:  { en: "Built by an Insider", zh: "内行人打造" },
    body:   { en: "Created by someone who walked the walk, got accepted, and coached others to do the same.", zh: "由真正走过这条路、亲历录取、并带领他人成功的人创建。" },
    accent: "#5B5F97",
    bg:     "#EEEEF7",
  },
  {
    icon: ShieldCheck,
    title:  { en: "Unmatched Quality Control", zh: "无与伦比的质量把控" },
    body:   { en: "Forget messy, AI-scraped lists with outdated links. Every program is manually reviewed for accuracy.", zh: "告别杂乱无章、满是失效链接的 AI 抓取列表。每个项目均经过人工核实，确保信息准确可靠。" },
    accent: "#FF6B6C",
    bg:     "#FFF0F0",
  },
  {
    icon: Crosshair,
    title:  { en: "Strategic Selection", zh: "精准项目匹配" },
    body:   { en: "Find programs that fit your exact background — whether you're a seasoned researcher or a 9th grader seeking your first opportunity.", zh: "无论你是经验丰富的高中科研生，还是寻找第一个机会的 9 年级新生，都能找到最适合你的项目。" },
    accent: "#FFC145",
    bg:     "#FFF8EC",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────
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
    await supabaseClient().auth.signOut();
    router.push("/login");
  };

  // Reveal refs
  const founder   = useReveal();
  // stats: 50% visible + 120px into viewport — numbers only count when user genuinely sees them
  const stats     = useReveal(0.5, "0px 0px -120px 0px");
  const valueGrid = useReveal(0.06);
  const adCta     = useReveal(0.12);

  // Count-up values — slightly slower so the animation is readable
  const count1 = useCountUp(6,  2200, stats.visible);
  const count2 = useCountUp(12, 2600, stats.visible);
  const count3 = useCountUp(60, 3200, stats.visible);

  // Typewriter — composes both paragraphs into one flowing block
  const founderText = lang === "en"
    ? `Hi, I'm Collin Jin. Just a couple of years ago, I was exactly where you are—DIYing my entire application process for summer programs and colleges. That hustle paid off: I got admitted to UCSB RMP and SRA, Harvey Mudd, and am now pursuing a dual degree in Electrical Engineering & CS at Northwestern's McCormick School of Engineering.\n\nAfter cracking the formula for standing out, I started mentoring students in the 2025–2026 application cycle. That's why I built SUMMER SELECT.`
    : `大家好，我是 Collin Jin。就在几年前，我和你一样——自己摸索着申请暑期项目和大学的全流程。那段努力没有白费：我成为了 UCSB RMP 和 SRA 的校友，被 Harvey Mudd 录取，目前正在西北大学麦考密克工程学院攻读电气工程与计算机科学双学位。\n\n在摸索出一套脱颖而出的方法论后，我开始在 2025–2026 申请季为学生提供指导。这就是我打造 SUMMER SELECT 的初衷。`;

  const { displayed: typedText, done: typingDone } = useTypewriter(
    founderText,
    founder.visible,
    lang === "zh" ? 30 : 18
  );

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFB", fontFamily: "var(--font-sans, system-ui)" }}>

      {/* ── Sticky nav bar ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "var(--color-brand-500)", borderBottom: "1px solid var(--color-brand-600)" }}
      >
        <span
          className="text-sm font-extrabold uppercase tracking-widest"
          style={{ color: "#FFFFFB", fontFamily: "var(--font-syne, sans-serif)", letterSpacing: "0.1em" }}
        >
          Summer Select
        </span>
        <div className="flex items-center gap-2">
          {/* Language pill toggle */}
          <div
            className="relative flex items-center rounded-full p-[3px]"
            style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <span
              aria-hidden="true"
              className="absolute top-[3px] bottom-[3px] rounded-full pointer-events-none"
              style={{
                left: "3px",
                width: "calc(50% - 3px)",
                background: lang === "zh" ? "var(--color-brand-accent)" : "rgba(255,255,255,0.93)",
                transform: lang === "zh" ? "translateX(100%)" : "translateX(0%)",
                transition: "transform 320ms cubic-bezier(0.34,1.56,0.64,1), background 250ms ease",
              }}
            />
            <button onClick={() => lang !== "en" && toggleLang()}
              className="relative z-10 px-3 py-1 text-xs font-bold rounded-full"
              style={{ color: lang === "en" ? "var(--color-brand-600)" : "rgba(255,255,255,0.5)", transition: "color 200ms ease" }}>
              EN
            </button>
            <button onClick={() => lang !== "zh" && toggleLang()}
              className="relative z-10 px-3 py-1 text-xs font-bold rounded-full"
              style={{ color: lang === "zh" ? "var(--color-brand-700)" : "rgba(255,255,255,0.5)", transition: "color 200ms ease" }}>
              中
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <LogOut className="h-3 w-3" />
            {t(copy.signOutShort)}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-14 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 60%, #FFF8EC 100%)" }}
      >
        {/* Blurred blobs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "#5B5F97" }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "#FFC145" }} />

        {/* Floating icon */}
        <div
          className="animate-float mb-4 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "var(--color-brand-500)", height: 56, width: 56 }}
        >
          <GraduationCap className="h-7 w-7 text-white" />
        </div>

        {/* Eyebrow */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{
            color: "var(--color-brand-500)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {t(copy.heroEyebrow)}
        </p>

        {/* Headline — 3-colour with gradient background accent */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] max-w-4xl text-balance"
          style={{
            color: "var(--color-brand-700)",
            fontFamily: "var(--font-syne, sans-serif)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-24px)",
            transition: "opacity 0.7s ease 0.05s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s",
          }}
        >
          {lang === "en" ? (
            <>
              Unlock Your Dream{" "}
              <span style={{ color: "var(--color-brand-500)" }}>Summer Program</span>{" "}
              <span style={{ color: "var(--color-brand-accent)" }}>with SUMMER SELECT</span>
            </>
          ) : (
            <>
              解锁你的梦想{" "}
              <span style={{ color: "var(--color-brand-500)" }}>暑期科研项目</span>{" "}
              <span style={{ color: "var(--color-brand-accent)" }}>· SUMMER SELECT</span>
            </>
          )}
        </h1>

        {/* Subhead */}
        <p
          className="mt-5 text-lg sm:text-xl max-w-xl leading-relaxed"
          style={{
            color: "#64748b",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {t(copy.heroSub)}
        </p>

        {/* Scroll hint */}
        <div className="animate-bounce-slow mt-14 flex flex-col items-center gap-1"
          style={{ color: "var(--color-brand-100)" }}>
          <span className="text-xs font-semibold uppercase tracking-widest">{t(copy.heroScroll)}</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. FOUNDER STORY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#FFFFFB" }}>
        <div className="max-w-3xl mx-auto" ref={founder.ref}>

          {/* Eyebrow */}
          <p
            className="text-xs font-bold uppercase tracking-widest mb-6 text-center"
            style={{
              color: "var(--color-brand-500)",
              opacity: founder.visible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            {t(copy.founderEyebrow)}
          </p>

          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid #E4E4F0",
              boxShadow: "0 4px 24px rgba(91,95,151,0.08)",
              opacity: founder.visible ? 1 : 0,
              transform: founder.visible ? "translateY(0)" : "translateY(28px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s",
            }}
          >
            {/* Photo + identity header */}
            <div
              className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 pt-8 pb-6"
              style={{ borderBottom: "1px solid #F0F0F8" }}
            >
              {/* Photo */}
              <div className="relative flex-shrink-0 h-24 w-24 rounded-2xl overflow-hidden shadow-md"
                style={{ outline: "2px solid var(--color-brand-100)" }}>
                <Image
                  src="/collinjin-founder-ss.jpg"
                  alt="Collin Jin"
                  fill
                  className="object-cover object-top"
                  sizes="96px"
                />
              </div>

              {/* Name + title + credential chips */}
              <div className="text-center sm:text-left flex-1">
                <p className="text-xl font-extrabold text-slate-900 leading-tight">Collin Jin</p>
                <p className="text-sm text-slate-500 mt-0.5 mb-3">
                  {lang === "en"
                    ? "Founder · Northwestern University (EE & CS)"
                    : "创始人 · 西北大学（电气工程与计算机科学）"}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {[
                    { label: "UCSB RMP", gold: true },
                    { label: "UCSB SRA", gold: true },
                    { label: "Harvey Mudd", gold: false },
                    { label: "Northwestern", gold: false },
                  ].map(({ label, gold }) => (
                    <span
                      key={label}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={
                        gold
                          ? { background: "#FFF3CC", color: "#92600A", border: "1px solid #FFD97D" }
                          : { background: "#EEEEF7", color: "#3a3d6e", border: "1px solid #C8C8E0" }
                      }
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Typing message body */}
            <div className="px-8 py-6">
              <div
                className="rounded-2xl p-5 text-sm leading-relaxed"
                style={{
                  background: "#F8F7FD",
                  border: "1px solid #E8E7F5",
                  color: "#374151",
                  minHeight: "7rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {typedText}
                {/* Blinking cursor */}
                {!typingDone && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 rounded-sm align-text-bottom"
                    style={{
                      background: "var(--color-brand-500)",
                      animation: "cursorBlink 0.8s ease-in-out infinite",
                    }}
                  />
                )}
                {/* Idle cursor after typing finishes */}
                {typingDone && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 rounded-sm align-text-bottom opacity-0"
                    style={{ background: "var(--color-brand-500)" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. STATS BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, #3a3d6e 0%, #5B5F97 100%)" }}
      >
        <div className="max-w-3xl mx-auto" ref={stats.ref}>
          {/* Heading */}
          <div
            className="text-center mb-10"
            style={{ opacity: stats.visible ? 1 : 0, transition: "opacity 0.5s ease" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-brand-accent)" }}>
              {t(copy.statsEyebrow)}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              {t(copy.statsH2)}
            </h2>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {/* Stat 1 */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.92)",
                transition: "opacity 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
              }}
            >
              <div
                className="font-black leading-none mb-3"
                style={{
                  fontSize: "clamp(3rem,8vw,4.5rem)",
                  color: "var(--color-brand-accent)",
                  fontFamily: "var(--font-syne, sans-serif)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count1}
              </div>
              <p className="text-white font-semibold text-base leading-snug mb-1.5">
                {t(copy.stat1Title)}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                {t(copy.stat1Body)}
              </p>
            </div>

            {/* Stat 2 */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.92)",
                transition: "opacity 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.25s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.25s",
              }}
            >
              <div
                className="font-black leading-none mb-3"
                style={{
                  fontSize: "clamp(3rem,8vw,4.5rem)",
                  color: "#FFB5B4",
                  fontFamily: "var(--font-syne, sans-serif)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count2}+
              </div>
              <p className="text-white font-semibold text-base leading-snug mb-1.5">
                {t(copy.stat2Title)}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                {t(copy.stat2Body)}
              </p>
            </div>

            {/* Stat 3 */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.92)",
                transition: "opacity 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.4s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.4s",
              }}
            >
              <div
                className="font-black leading-none mb-3"
                style={{
                  fontSize: "clamp(3rem,8vw,4.5rem)",
                  color: "#FF6B6C",
                  fontFamily: "var(--font-syne, sans-serif)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count3}+
              </div>
              <p className="text-white font-semibold text-base leading-snug mb-1.5">
                {t(copy.stat3Title)}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                {t(copy.stat3Body)}
              </p>
            </div>
          </div>

          {/* Closing */}
          <p
            className="text-center text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            style={{
              color: "rgba(255,255,255,0.68)",
              opacity: stats.visible ? 1 : 0,
              transition: "opacity 0.6s ease 0.5s",
            }}
          >
            {lang === "en" ? (
              <>
                {copy.statsClosing.en.split("That's why I built SUMMER SELECT.")[0]}
                <strong className="text-white">That&apos;s why I built SUMMER SELECT.</strong>
              </>
            ) : (
              <>
                {copy.statsClosing.zh.split("这就是我打造 SUMMER SELECT 的初衷。")[0]}
                <strong className="text-white">这就是我打造 SUMMER SELECT 的初衷。</strong>
              </>
            )}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. VALUE PROP GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#FFFFFB" }}>
        <div className="max-w-3xl mx-auto">
          <div
            ref={valueGrid.ref}
            className="text-center mb-10"
            style={{
              opacity: valueGrid.visible ? 1 : 0,
              transform: valueGrid.visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-brand-500)" }}>
              {t(copy.valueEyebrow)}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}>
              {t(copy.valueH2)}
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {t(copy.valueSub)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {valueCards.map(({ icon: Icon, title, body, accent, bg }, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "#fff",
                  border: "1px solid #E4E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  opacity: valueGrid.visible ? 1 : 0,
                  transform: valueGrid.visible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.13}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.13}s`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-5px)";
                  el.style.boxShadow = `0 12px 28px rgba(0,0,0,0.09), 0 0 0 2px ${accent}30`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1.5">{t(title)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(body)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. AD CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 100%)", borderTop: "1px solid #E4E4F0" }}
      >
        <div
          ref={adCta.ref}
          className="max-w-xl mx-auto"
          style={{
            opacity: adCta.visible ? 1 : 0,
            transform: adCta.visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.65s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "var(--color-brand-700)" }}>
            {t(copy.ctaBody)}
          </p>
          <button
            className="animate-cta-pulse inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{ background: "var(--color-brand-500)", color: "#FFFFFB" }}
            onClick={() => document.getElementById("compare-table")?.scrollIntoView({ behavior: "smooth" })}
          >
            <GraduationCap className="h-4 w-4 flex-shrink-0" />
            {t(copy.ctaBtn)}
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. COMPARE TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="compare-table"
        className="py-16 px-6"
        style={{ background: "#F8F8FC" }}
      >
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-brand-500)" }}>
              {t(copy.tableEyebrow)}
            </p>
            <h2 className="text-2xl font-extrabold"
              style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}>
              {t(copy.tableH2)}
            </h2>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t(copy.tableHeaders.feature)}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{t(copy.tableHeaders.free)}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--color-brand-500)" }}>{t(copy.tableHeaders.paid)}</div>
            </div>
            {copy.freeFeatures.map((f) => (
              <div key={f.en} className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0">
                <div className="text-sm text-slate-700">{t(f)}</div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
              </div>
            ))}
            {copy.paidFeatures.map((f) => (
              <div key={f.en} className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0"
                style={{ background: "rgba(238,238,247,0.3)" }}>
                <div className="text-sm text-slate-700">{t(f)}</div>
                <div className="flex justify-center"><XCircle className="h-4 w-4 text-slate-300" /></div>
                <div className="flex justify-center"><CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} /></div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className="rounded-2xl p-8 text-center mb-6 shadow"
            style={{ background: "linear-gradient(135deg, #3a3d6e 0%, #5B5F97 100%)" }}
          >
            <h2 className="text-lg font-bold text-white mb-1.5">{t(copy.contactH2)}</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>{t(copy.contactSub)}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="flex items-center justify-center gap-2 rounded-xl px-5 py-3"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <MessageCircle className="h-4 w-4" style={{ color: "rgba(255,255,255,0.65)" }} />
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{t(copy.wechatLabel)}</p>
                  <p className="font-semibold text-sm text-white">collinxuezhang</p>
                </div>
              </div>
              <a
                href="https://instagram.com/collin.jin"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
              >
                <ExternalLink className="h-4 w-4" style={{ color: "rgba(255,255,255,0.65)" }} />
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Instagram</p>
                  <p className="font-semibold text-sm text-white">@collin.jin</p>
                </div>
              </a>
            </div>
          </div>

          {/* Sign out */}
          <div className="text-center pb-4">
            <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-slate-600 text-sm">
              <LogOut className="h-4 w-4" />
              {t(copy.signOutFull)}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
