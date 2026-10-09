"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, LogIn, Compass, ArrowRight, ChevronDown, Sparkles, Languages, FileText, Layers,
} from "lucide-react";
import { Starfield, trackPointer } from "./effects";
import { useCountUp, useT } from "./hooks";
import { COACHED_PROGRAMS, copy } from "./copy";

/** Decorative chips that drift around the headline on wide screens. */
const FLOATERS = [
  { label: "UCSB RMP",      pos: "top-[16%] left-[5%]",    tilt: "-4deg", delay: "0s" },
  { label: "UChicago RIBS", pos: "top-[30%] right-[4%]",   tilt: "5deg",  delay: "1.1s" },
  { label: "Pioneer",       pos: "bottom-[24%] left-[8%]", tilt: "4deg",  delay: "2.2s" },
  { label: "UCSC SIP",      pos: "bottom-[30%] right-[7%]", tilt: "-5deg", delay: "0.6s" },
  { label: "SSP",           pos: "top-[10%] right-[22%]",  tilt: "3deg",  delay: "1.7s" },
] as const;

export function HeroSection({
  isSignedIn,
  programCount,
}: {
  isSignedIn: boolean;
  programCount: number;
}) {
  const { lang, t } = useT();
  const [mounted, setMounted] = useState(false);

  // Flip after first paint so the entrance transitions actually run.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const programs = useCountUp(programCount, 1800, mounted);
  const essays = useCountUp(60, 2000, mounted);

  const enter = (delay: number, y = -24) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : `translateY(${y}px)`,
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <section
      onMouseMove={trackPointer}
      className="relative flex flex-col items-center justify-center text-center px-6 pt-14 pb-14 sm:pt-16 sm:pb-16 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 58%, #FFF8EC 100%)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(91,95,151,0.16) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
        aria-hidden
      />

      {/* Drifting colour blobs */}
      <div className="animate-blob-a absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "#5B5F97" }} aria-hidden />
      <div className="animate-blob-b absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "#FFC145" }} aria-hidden />
      <div className="animate-blob-a absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "#FFB5B4", animationDelay: "-6s" }} aria-hidden />

      {/* Cursor glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(520px circle at var(--mx, 50%) var(--my, 30%), rgba(255,193,69,0.16), transparent 60%)" }}
        aria-hidden
      />

      <Starfield color="#5B5F97" />

      {/* Floating program chips */}
      {FLOATERS.map((f) => (
        <div
          key={f.label}
          className={`animate-rise-float hidden 2xl:flex absolute ${f.pos} items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-md pointer-events-none`}
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid #E4E4F0",
            color: "var(--color-brand-600)",
            backdropFilter: "blur(6px)",
            ["--tilt" as string]: f.tilt,
            animationDelay: f.delay,
            opacity: mounted ? 1 : 0,
            transition: "opacity 1s ease 0.8s",
          }}
          aria-hidden
        >
          <Sparkles className="h-3 w-3" style={{ color: "var(--color-brand-accent)" }} />
          {f.label}
        </div>
      ))}

      <div className="relative z-10 flex w-full max-w-full flex-col items-center">
        {/* Floating icon with ping rings */}
        <div className="relative mb-5" style={enter(0, -10)}>
          <span className="animate-ring-ping absolute inset-0 rounded-2xl" style={{ background: "var(--color-brand-500)" }} aria-hidden />
          <div
            className="animate-float relative rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #5B5F97, #3a3d6e)", height: 64, width: 64 }}
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>

        <p
          className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.25em] mb-4 inline-flex max-w-full items-center gap-2 rounded-full px-3.5 sm:px-4 py-1.5"
          style={{
            color: "var(--color-brand-500)",
            background: "rgba(91,95,151,0.08)",
            border: "1px solid rgba(91,95,151,0.18)",
            ...enter(0.05, -10),
          }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--color-brand-accent)" }} />
          {t(copy.heroEyebrow)}
        </p>

        <h1
          className="text-[2rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] max-w-5xl text-balance break-words"
          style={{
            color: "var(--color-brand-700)",
            fontFamily: "var(--font-syne, sans-serif)",
            ...enter(0.1),
          }}
        >
          {lang === "en" ? (
            <>
              Unlock Your Dream{" "}
              <span className="text-shimmer">Summer Program</span>{" "}
              <span style={{ color: "var(--color-brand-accent)" }}>with SUMMER SELECT</span>
            </>
          ) : (
            <>
              解锁你的梦想{" "}
              <span className="text-shimmer">暑期项目</span>{" "}
              <span style={{ color: "var(--color-brand-accent)" }}>SUMMER SELECT</span>
            </>
          )}
        </h1>

        <p
          className="mt-5 text-base sm:text-xl max-w-2xl leading-relaxed"
          style={{ color: "#64748b", ...enter(0.25, -12) }}
        >
          {t(copy.heroSub)}
        </p>

        {/* Calls to action */}
        <div className="mt-8 flex flex-col items-center gap-4" style={enter(0.4, 16)}>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Link
                href="/dashboard"
                className="btn-shine animate-cta-pulse group relative inline-flex items-center gap-2.5 sm:gap-3 whitespace-nowrap rounded-2xl px-5 py-4 sm:px-11 sm:py-5 text-[15px] sm:text-xl font-extrabold shadow-xl transition-transform duration-200 hover:scale-[1.06] active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FFC145 0%, #FFD36E 100%)",
                  color: "var(--color-brand-700)",
                  border: "2px solid rgba(58,61,110,0.12)",
                }}
              >
                <Compass className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                {t(copy.ctaBrowse)}
                <ArrowRight className="animate-arrow h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              </Link>
            </div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-brand-500)" }}>
              ✦ {t(copy.ctaBrowseNote)}
            </span>
          </div>

          {!isSignedIn && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-150 hover:scale-105 active:scale-95 hover:shadow-md"
              style={{
                background: "#FFFFFB",
                color: "var(--color-brand-600)",
                borderColor: "var(--color-brand-100)",
              }}
            >
              <LogIn className="h-4 w-4" />
              {t(copy.ctaLogin)}
            </Link>
          )}
        </div>

        {/* Live stat pills */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          style={enter(0.55, 16)}
        >
          {programCount > 0 && (
            <Pill icon={<Layers className="h-4 w-4" />}>
              <strong className="tabular-nums">{programs}</strong> {t(copy.heroPillPrograms)}
            </Pill>
          )}
          <Pill icon={<FileText className="h-4 w-4" />}>
            <strong className="tabular-nums">{essays}+</strong> {t(copy.heroPillEssays)}
          </Pill>
          <Pill icon={<Languages className="h-4 w-4" />}>
            <strong>{t(copy.heroPillBilingual)}</strong>
          </Pill>
        </div>

        <div className="animate-bounce-slow mt-10 flex flex-col items-center gap-1"
          style={{ color: "var(--color-brand-200)" }}>
          <span className="text-xs font-semibold uppercase tracking-widest">{t(copy.heroScroll)}</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #E4E4F0",
        color: "var(--color-brand-700)",
      }}
    >
      <span style={{ color: "var(--color-brand-500)" }}>{icon}</span>
      {children}
    </span>
  );
}

/** Infinite marquee of programs Collin has coached students into. */
export function ProgramMarquee() {
  const { t } = useT();
  const items = [...COACHED_PROGRAMS, ...COACHED_PROGRAMS, ...COACHED_PROGRAMS, ...COACHED_PROGRAMS];
  return (
    <div
      className="marquee-wrap relative overflow-hidden py-5"
      style={{ background: "#3a3d6e", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] mb-3"
        style={{ color: "var(--color-brand-accent)" }}>
        {t(copy.marqueeLabel)}
      </p>
      <div
        className="flex"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap">
          {items.map((name, i) => (
            <span key={i} className="inline-flex items-center gap-10 text-lg sm:text-xl font-extrabold text-white/90"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              {name}
              <Sparkles className="h-4 w-4" style={{ color: "var(--color-brand-accent)" }} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
