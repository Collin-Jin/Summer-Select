"use client";

import { BadgeCheck, ShieldOff, Languages, Layers, FileText, ListChecks, MessagesSquare } from "lucide-react";
import { Reveal, Starfield, tiltOnMove, tiltReset, trackPointer } from "./effects";
import { useCountUp, useReveal, useT } from "./hooks";
import { copy } from "./copy";

// ─────────────────────────────────────────────────────────────────────────────
// Coaching results (dark)
// ─────────────────────────────────────────────────────────────────────────────
export function CoachingStats() {
  const { lang, t } = useT();
  // 50% visible, so numbers only count when the visitor genuinely sees them.
  const [ref, visible] = useReveal(0.5, "0px 0px -120px 0px");
  const c1 = useCountUp(6, 2200, visible);
  const c2 = useCountUp(12, 2600, visible);
  const c3 = useCountUp(60, 3200, visible);

  const cards = [
    { value: `${c1}`,  color: "var(--color-brand-accent)", title: copy.stat1Title, body: copy.stat1Body },
    { value: `${c2}+`, color: "#FFB5B4",                   title: copy.stat2Title, body: copy.stat2Body },
    { value: `${c3}+`, color: "#FF6B6C",                   title: copy.stat3Title, body: copy.stat3Body },
  ];

  const closingSplit =
    lang === "en"
      ? copy.statsClosing.en.split("That's why I built SUMMER SELECT.")[0]
      : copy.statsClosing.zh.split("这就是我打造 SUMMER SELECT 的初衷。")[0];
  const closingBold = lang === "en" ? "That's why I built SUMMER SELECT." : "这就是我打造 SUMMER SELECT 的初衷。";

  return (
    <section
      className="relative py-20 sm:py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #3a3d6e 0%, #5B5F97 100%)" }}
    >
      {/* Aurora + orbit decoration */}
      <div className="animate-blob-a absolute -top-24 left-1/4 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "#FFC145" }} aria-hidden />
      <div className="animate-blob-b absolute -bottom-32 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "#FF6B6C" }} aria-hidden />
      <div className="animate-spin-slow absolute -right-40 -top-40 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{ border: "1px dashed rgba(255,255,255,0.15)" }} aria-hidden />
      <div className="animate-spin-slow absolute -left-48 -bottom-48 w-[32rem] h-[32rem] rounded-full pointer-events-none"
        style={{ border: "1px dashed rgba(255,193,69,0.2)", animationDirection: "reverse" }} aria-hidden />
      <Starfield />

      <div className="relative max-w-4xl mx-auto" ref={ref}>
        <div
          className="text-center mb-12"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-accent)" }}>
            {t(copy.statsEyebrow)}
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
            {t(copy.statsH2)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {cards.map((c, i) => (
            <div
              key={i}
              className="spotlight rounded-2xl p-7 transition-[transform,box-shadow] duration-200 hover:shadow-2xl"
              onMouseMove={(e) => { trackPointer(e); tiltOnMove(e, 7); }}
              onMouseLeave={tiltReset}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(6px)",
                ["--spot" as string]: "rgba(255,193,69,0.18)",
                opacity: visible ? 1 : 0,
                translate: visible ? "0 0" : "0 24px",
                scale: visible ? "1" : "0.92",
                transitionProperty: "opacity, translate, scale, transform, box-shadow",
                transitionDuration: "0.65s, 0.65s, 0.65s, 0.2s, 0.2s",
                transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                transitionDelay: `${0.1 + i * 0.15}s, ${0.1 + i * 0.15}s, ${0.1 + i * 0.15}s, 0s, 0s`,
              }}
            >
              <div
                className="font-black leading-none mb-3"
                style={{
                  fontSize: "clamp(3.25rem,8vw,5rem)",
                  color: c.color,
                  fontFamily: "var(--font-syne, sans-serif)",
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "0 0 32px rgba(255,255,255,0.12)",
                }}
              >
                {c.value}
              </div>
              <p className="text-white font-semibold text-base leading-snug mb-1.5">{t(c.title)}</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{t(c.body)}</p>
            </div>
          ))}
        </div>

        <p
          className="text-center text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          style={{
            color: "rgba(255,255,255,0.72)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 0.7s",
          }}
        >
          {closingSplit}
          <strong className="text-white">{closingBold}</strong>
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform contents (light)
// ─────────────────────────────────────────────────────────────────────────────
export function PlatformStats({ programCount }: { programCount: number }) {
  const { t } = useT();
  const [ref, visible] = useReveal(0.3, "0px 0px -80px 0px");
  const programs = useCountUp(programCount, 1800, visible);
  const essays = useCountUp(60, 2200, visible);
  const prompts = useCountUp(30, 2000, visible);
  const interview = useCountUp(75, 2400, visible);

  const items = [
    ...(programCount > 0
      ? [{ icon: Layers, value: `${programs}`, label: copy.platformStats.programs, accent: "#5B5F97", bg: "#EEEEF7" }]
      : []),
    { icon: FileText, value: `${essays}+`, label: copy.platformStats.essays, accent: "#FF6B6C", bg: "#FFF0F0" },
    { icon: ListChecks, value: `${prompts}+`, label: copy.platformStats.prompts, accent: "#C98A00", bg: "#FFF8EC" },
    { icon: MessagesSquare, value: `${interview}+`, label: copy.platformStats.interview, accent: "#5B5F97", bg: "#EEEEF7" },
  ];

  const strip = [
    { icon: BadgeCheck, label: copy.platformStrip.manual },
    { icon: ShieldOff, label: copy.platformStrip.scraped },
    { icon: Languages, label: copy.platformStrip.bilingual },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden" style={{ background: "#F8F8FC" }}>
      <div className="relative max-w-4xl mx-auto" ref={ref}>
        <Reveal className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-500)" }}>
            {t(copy.platformEyebrow)}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-balance"
            style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}>
            {t(copy.platformH2)}
          </h2>
        </Reveal>

        <div className={`grid grid-cols-2 ${items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-8`}>
          {items.map(({ icon: Icon, value, label, accent, bg }, i) => (
            <div
              key={i}
              className="spotlight rounded-2xl p-5 sm:p-6 bg-white text-center"
              onMouseMove={(e) => { trackPointer(e); tiltOnMove(e, 8); }}
              onMouseLeave={tiltReset}
              style={{
                border: "1px solid #E4E4F0",
                boxShadow: "0 2px 12px rgba(91,95,151,0.07)",
                ["--spot" as string]: `${accent}22`,
                opacity: visible ? 1 : 0,
                translate: visible ? "0 0" : "0 26px",
                transitionProperty: "opacity, translate, transform",
                transitionDuration: "0.6s, 0.6s, 0.2s",
                transitionDelay: `${i * 0.1}s, ${i * 0.1}s, 0s`,
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="mx-auto mb-3 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>
              <div
                className="font-black leading-none"
                style={{
                  fontSize: "clamp(2.25rem,6vw,3.25rem)",
                  color: accent,
                  fontFamily: "var(--font-syne, sans-serif)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </div>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-600">{t(label)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {strip.map(({ icon: Icon, label }, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background: "#fff",
                border: "1px solid #E4E4F0",
                color: "var(--color-brand-700)",
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.7)",
                transition: `opacity 0.4s ease ${0.5 + i * 0.12}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.12}s`,
              }}
            >
              <Icon className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
              {t(label)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
