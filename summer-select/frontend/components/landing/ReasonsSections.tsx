"use client";

import { Reveal, tiltOnMove, tiltReset, trackPointer } from "./effects";
import { useReveal, useT } from "./hooks";
import { copy, reasons, steps, valueCards } from "./copy";

function Heading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="text-center mb-12" y={20}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-500)" }}>
        {eyebrow}
      </p>
      <h2
        className="text-3xl sm:text-4xl font-extrabold mb-3 text-balance"
        style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}
      >
        {title}
      </h2>
      {sub && <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">{sub}</p>}
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Why SUMMER SELECT — three principles
// ─────────────────────────────────────────────────────────────────────────────
export function ValueSection() {
  const { t } = useT();
  const [ref, visible] = useReveal(0.06);
  return (
    <section className="py-20 sm:py-24 px-6" style={{ background: "#FFFFFB" }}>
      <div className="max-w-4xl mx-auto">
        <Heading eyebrow={t(copy.valueEyebrow)} title={t(copy.valueH2)} sub={t(copy.valueSub)} />
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {valueCards.map(({ icon: Icon, title, body, accent, bg }, i) => (
            <div
              key={i}
              className="spotlight rounded-2xl p-6 flex flex-col gap-4 bg-white"
              onMouseMove={(e) => { trackPointer(e); tiltOnMove(e, 7); }}
              onMouseLeave={tiltReset}
              style={{
                border: "1px solid #E4E4F0",
                boxShadow: "0 2px 10px rgba(91,95,151,0.06)",
                ["--spot" as string]: `${accent}22`,
                opacity: visible ? 1 : 0,
                translate: visible ? "0 0" : "0 30px",
                transitionProperty: "opacity, translate, transform, box-shadow",
                transitionDuration: "0.7s, 0.7s, 0.2s, 0.2s",
                transitionDelay: `${0.1 + i * 0.13}s, ${0.1 + i * 0.13}s, 0s, 0s`,
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="h-6 w-6" style={{ color: accent }} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-1.5">{t(title)}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t(body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Six reasons to register
// ─────────────────────────────────────────────────────────────────────────────
export function ReasonsSection() {
  const { t } = useT();
  const [ref, visible] = useReveal(0.06);
  return (
    <section className="relative py-20 sm:py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #EEEEF7 100%)" }}>
      <div className="animate-blob-a absolute -left-20 top-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "#FFC145" }} aria-hidden />
      <div className="animate-blob-b absolute -right-20 bottom-10 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "#FF6B6C" }} aria-hidden />

      <div className="relative max-w-5xl mx-auto">
        <Heading eyebrow={t(copy.reasonsEyebrow)} title={t(copy.reasonsH2)} sub={t(copy.reasonsSub)} />

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map(({ icon: Icon, title, body, chip, accent, bg }, i) => (
            <div
              key={i}
              className="spotlight group rounded-2xl p-6 bg-white flex flex-col gap-4"
              onMouseMove={(e) => { trackPointer(e); tiltOnMove(e, 6); }}
              onMouseLeave={tiltReset}
              style={{
                border: "1px solid #E4E4F0",
                boxShadow: "0 2px 14px rgba(91,95,151,0.08)",
                ["--spot" as string]: `${accent}26`,
                opacity: visible ? 1 : 0,
                translate: visible ? "0 0" : "0 36px",
                scale: visible ? "1" : "0.95",
                transitionProperty: "opacity, translate, scale, transform, box-shadow",
                transitionDuration: "0.75s, 0.75s, 0.75s, 0.2s, 0.2s",
                transitionDelay: `${0.05 + i * 0.1}s, ${0.05 + i * 0.1}s, ${0.05 + i * 0.1}s, 0s, 0s`,
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{ background: bg }}
                >
                  <Icon className="h-6 w-6" style={{ color: accent }} />
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{ background: bg, color: accent === "#FFC145" ? "#92600A" : accent }}
                >
                  {t(chip)}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1.5" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                  <span className="mr-2 tabular-nums" style={{ color: accent === "#FFC145" ? "#C98A00" : accent }}>
                    0{i + 1}
                  </span>
                  {t(title)}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t(body)}</p>
              </div>
              {/* Accent underline that grows on hover */}
              <div
                className="mt-auto h-1 rounded-full origin-left scale-x-[0.18] transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works
// ─────────────────────────────────────────────────────────────────────────────
export function StepsSection() {
  const { t } = useT();
  const [ref, visible] = useReveal(0.2);
  return (
    <section className="py-20 sm:py-24 px-6" style={{ background: "#FFFFFB" }}>
      <div className="max-w-4xl mx-auto">
        <Heading eyebrow={t(copy.stepsEyebrow)} title={t(copy.stepsH2)} />

        <div ref={ref} className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-8 left-[16.6%] right-[16.6%] h-[3px] rounded-full overflow-hidden" style={{ background: "#E4E4F0" }} aria-hidden>
            <div
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg, #5B5F97, #FFC145, #FF6B6C)",
                transform: visible ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 1.6s cubic-bezier(0.65,0,0.35,1) 0.3s",
              }}
            />
          </div>

          {steps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center"
              style={{
                opacity: visible ? 1 : 0,
                translate: visible ? "0 0" : "0 24px",
                transition: `opacity 0.7s ease ${0.2 + i * 0.35}s, translate 0.7s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.35}s`,
              }}
            >
              <div className="relative mb-5">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: i === 2 ? "linear-gradient(135deg,#FFC145,#FFD36E)" : "linear-gradient(135deg,#5B5F97,#3a3d6e)" }}
                >
                  <Icon className="h-7 w-7" style={{ color: i === 2 ? "#3a3d6e" : "#fff" }} />
                </div>
                <span
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full text-xs font-extrabold flex items-center justify-center"
                  style={{ background: "#FF6B6C", color: "#fff", border: "2px solid #FFFFFB" }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1.5" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                {t(title)}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[16rem]">{t(body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
