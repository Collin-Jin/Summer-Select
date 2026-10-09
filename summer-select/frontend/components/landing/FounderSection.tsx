"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { tiltOnMove, tiltReset, trackPointer } from "./effects";
import { useReveal, useT, useTypewriter } from "./hooks";
import { copy, founderText } from "./copy";

const CREDENTIALS = [
  { label: "UCSB RMP", gold: true },
  { label: "UCSB SRA", gold: true },
  { label: "Harvey Mudd", gold: false },
  { label: "Northwestern", gold: false },
];

export function FounderSection() {
  const { lang, t } = useT();
  const [ref, visible] = useReveal();
  const { displayed, done } = useTypewriter(founderText[lang], visible, lang === "zh" ? 30 : 18);

  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden" style={{ background: "#FFFFFB" }}>
      <div className="animate-blob-b absolute -left-24 top-10 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "#FFC145" }} aria-hidden />
      <div className="animate-blob-a absolute -right-24 bottom-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "#5B5F97" }} aria-hidden />

      <div className="relative max-w-3xl mx-auto" ref={ref}>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-6 text-center"
          style={{
            color: "var(--color-brand-500)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {t(copy.founderEyebrow)}
        </p>

        {/* Animated gradient border */}
        <div
          className="rounded-3xl p-[2px]"
          style={{
            background: "linear-gradient(120deg, #5B5F97, #FFC145, #FF6B6C, #5B5F97)",
            backgroundSize: "300% 300%",
            animation: visible ? "gradientShift 8s linear infinite" : undefined,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s",
          }}
        >
          <div
            className="spotlight rounded-[22px] overflow-hidden bg-white"
            onMouseMove={trackPointer}
            style={{ boxShadow: "0 12px 48px rgba(91,95,151,0.14)", ["--spot" as string]: "rgba(255,193,69,0.12)" }}
          >
            <div
              className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 pt-8 pb-6"
              style={{ borderBottom: "1px solid #F0F0F8" }}
            >
              <div
                className="relative flex-shrink-0 h-28 w-28 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:-rotate-2"
                style={{ outline: "3px solid var(--color-brand-100)", outlineOffset: 3 }}
                onMouseMove={(e) => tiltOnMove(e, 10)}
                onMouseLeave={tiltReset}
              >
                <Image
                  src="/collinjin-founder-ss.jpg"
                  alt="Collin Jin"
                  fill
                  className="object-cover object-top"
                  sizes="112px"
                />
              </div>

              <div className="text-center sm:text-left flex-1">
                <p className="text-2xl font-extrabold text-slate-900 leading-tight flex items-center justify-center sm:justify-start gap-2">
                  Collin Jin
                  <GraduationCap className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
                </p>
                <p className="text-sm text-slate-500 mt-0.5 mb-3">
                  {lang === "en"
                    ? "Founder · Northwestern University (EE & CS)"
                    : "创始人 · 西北大学（电气工程与计算机科学）"}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {CREDENTIALS.map(({ label, gold }, i) => (
                    <span
                      key={label}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5"
                      style={{
                        ...(gold
                          ? { background: "#FFF3CC", color: "#92600A", border: "1px solid #FFD97D" }
                          : { background: "#EEEEF7", color: "#3a3d6e", border: "1px solid #C8C8E0" }),
                        opacity: visible ? 1 : 0,
                        transform: visible ? "scale(1)" : "scale(0.6)",
                        transition: `opacity 0.4s ease ${0.5 + i * 0.12}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.12}s`,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              <div
                className="rounded-2xl p-5 text-sm sm:text-base leading-relaxed"
                style={{
                  background: "#F8F7FD",
                  border: "1px solid #E8E7F5",
                  color: "#374151",
                  minHeight: "7rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {displayed}
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 rounded-sm align-text-bottom"
                  style={{
                    background: "var(--color-brand-500)",
                    animation: done ? undefined : "cursorBlink 0.8s ease-in-out infinite",
                    opacity: done ? 0 : 1,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
