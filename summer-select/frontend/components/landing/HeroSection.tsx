"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, ArrowRight, ChevronDown, Sparkles, Languages, FileText, Layers, BadgeCheck } from "lucide-react";
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
      className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 overflow-hidden"
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
              {/* Soft glow behind the button */}
              <span
                aria-hidden
                className="absolute -inset-1.5 rounded-full opacity-50 blur-lg"
                style={{ background: "linear-gradient(135deg, #FFC145, #FF6B6C)" }}
              />
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-3 sm:gap-5 whitespace-nowrap rounded-full py-2 pl-6 pr-2 sm:py-2.5 sm:pl-9 sm:pr-2.5 text-[15px] sm:text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #5B5F97 0%, #3a3d6e 100%)",
                  boxShadow: "0 14px 34px -10px rgba(58,61,110,0.7), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                <span>{t(copy.ctaBrowse)}</span>
                <span
                  className="animate-cta-pulse flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110"
                  style={{ background: "#FFC145", color: "#3a3d6e" }}
                >
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
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

/** One scrolling row of program cards. The list is repeated so the loop never shows a gap. */
function MarqueeRow({
  programs,
  reverse = false,
  seconds,
  admitted,
}: {
  programs: readonly { name: string; tag: string }[];
  reverse?: boolean;
  seconds: number;
  admitted: string;
}) {
  const items = [...programs, ...programs, ...programs, ...programs];
  return (
    <div
      className="flex"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className={`${reverse ? "animate-marquee-reverse" : "animate-marquee"} flex shrink-0 items-center gap-5 pr-5 py-2 whitespace-nowrap`}
        style={{ animationDuration: `${seconds}s` }}
      >
        {items.map((p, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 rounded-2xl px-5 py-4 sm:px-6 sm:py-5 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              backdropFilter: "blur(6px)",
            }}
          >
            <span
              className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl text-[11px] sm:text-xs font-extrabold tracking-wide transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-accent), var(--color-brand-coral))",
                color: "#2d3061",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              {p.tag}
            </span>
            <span className="flex flex-col">
              <span
                className="text-lg sm:text-2xl font-extrabold leading-tight text-white"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                {p.name}
              </span>
              <span
                className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--color-brand-accent)" }}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {admitted}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two counter-scrolling rows of the programs Collin has coached students into. */
export function ProgramMarquee() {
  const { t } = useT();
  const admitted = t(copy.marqueeAdmitted);
  const first = COACHED_PROGRAMS;
  // The second row starts from the middle of the list so the rows never line up.
  const second = [...COACHED_PROGRAMS.slice(4), ...COACHED_PROGRAMS.slice(0, 4)];

  return (
    <section
      aria-label={t(copy.marqueeLabel)}
      className="marquee-wrap relative overflow-hidden py-14 sm:py-20"
      style={{ background: "linear-gradient(180deg, #3a3d6e 0%, #2d3061 100%)" }}
    >
      {/* Glow and grid backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-24 left-1/4 h-72 w-72 rounded-full opacity-25 blur-3xl animate-blob-a"
          style={{ background: "var(--color-brand-accent)" }}
        />
        <div
          className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl animate-blob-b"
          style={{ background: "var(--color-brand-coral)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative mb-9 sm:mb-12 px-4 text-center">
        <p
          className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.32em]"
          style={{ color: "var(--color-brand-accent)" }}
        >
          <span aria-hidden className="h-px w-8 sm:w-14" style={{ background: "linear-gradient(90deg, transparent, var(--color-brand-accent))" }} />
          <Sparkles className="h-4 w-4" />
          {t(copy.marqueeLabel)}
          <Sparkles className="h-4 w-4" />
          <span aria-hidden className="h-px w-8 sm:w-14" style={{ background: "linear-gradient(270deg, transparent, var(--color-brand-accent))" }} />
        </p>
        <h2
          className="mt-3 text-3xl sm:text-5xl font-extrabold text-white"
          style={{ fontFamily: "var(--font-syne, sans-serif)" }}
        >
          {t(copy.marqueeTitle)}
        </h2>
      </div>

      <div className="relative space-y-4">
        <MarqueeRow programs={first} seconds={55} admitted={admitted} />
        <MarqueeRow programs={second} reverse seconds={65} admitted={admitted} />
      </div>
    </section>
  );
}
