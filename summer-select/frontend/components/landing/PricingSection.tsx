"use client";

import { CheckCircle2, XCircle, GraduationCap, MessageCircle, Camera, Mail, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { Reveal, Starfield, trackPointer } from "./effects";
import { useCopy, useReveal, useT } from "./hooks";
import { CONTACT, copy } from "./copy";

// ─────────────────────────────────────────────────────────────────────────────
// Ad CTA
// ─────────────────────────────────────────────────────────────────────────────
export function AdCtaSection() {
  const { t } = useT();
  return (
    <section
      className="relative py-20 px-6 text-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #EEEEF7 0%, #FFFFFB 100%)", borderTop: "1px solid #E4E4F0" }}
    >
      <div className="animate-blob-a absolute left-1/2 -translate-x-1/2 -top-24 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "#FFC145" }} aria-hidden />
      <Reveal className="relative max-w-xl mx-auto">
        <p className="text-lg sm:text-xl leading-relaxed mb-8" style={{ color: "var(--color-brand-700)" }}>
          {t(copy.ctaBody)}
        </p>
        <button
          className="btn-shine animate-cta-pulse inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm sm:text-base font-bold transition-transform duration-150 hover:scale-105 active:scale-95"
          style={{ background: "var(--color-brand-500)", color: "#FFFFFB" }}
          onClick={() => document.getElementById("compare-table")?.scrollIntoView({ behavior: "smooth" })}
        >
          <GraduationCap className="h-5 w-5 flex-shrink-0" />
          {t(copy.ctaBtn)}
        </button>
      </Reveal>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Free vs paid + contact
// ─────────────────────────────────────────────────────────────────────────────
export function PricingSection() {
  const { t } = useT();
  const [tableRef, tableVisible] = useReveal(0.15);

  const rows = [
    ...copy.freeFeatures.map((f) => ({ f, paidOnly: false })),
    ...copy.paidFeatures.map((f) => ({ f, paidOnly: true })),
  ];

  return (
    <section id="compare-table" className="py-20 px-6" style={{ background: "#F8F8FC" }}>
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-8" y={20}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-500)" }}>
            {t(copy.tableEyebrow)}
          </p>
          <h2 className="text-3xl font-extrabold"
            style={{ color: "var(--color-brand-700)", fontFamily: "var(--font-syne, sans-serif)" }}>
            {t(copy.tableH2)}
          </h2>
        </Reveal>

        <div ref={tableRef} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t(copy.tableHeaders.feature)}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{t(copy.tableHeaders.free)}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-center" style={{ color: "var(--color-brand-500)" }}>
              {t(copy.tableHeaders.paid)}
            </div>
          </div>
          {rows.map(({ f, paidOnly }, i) => (
            <div
              key={f.en}
              className="grid grid-cols-3 px-6 py-3.5 border-b border-slate-50 last:border-0 transition-colors hover:bg-[#EEEEF7]/60"
              style={{
                background: paidOnly ? "rgba(238,238,247,0.35)" : undefined,
                opacity: tableVisible ? 1 : 0,
                translate: tableVisible ? "0 0" : "-16px 0",
                transition: `opacity 0.5s ease ${i * 0.07}s, translate 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s, background-color 0.15s`,
              }}
            >
              <div className="text-sm text-slate-700">{t(f)}</div>
              <div className="flex justify-center">
                {paidOnly
                  ? <XCircle className="h-4 w-4 text-slate-300" />
                  : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <div className="flex justify-center">
                <CheckCircle2
                  className={paidOnly ? "h-5 w-5" : "h-4 w-4 text-emerald-500"}
                  style={paidOnly ? { color: "var(--color-brand-500)" } : undefined}
                />
              </div>
            </div>
          ))}
        </div>

        <ContactCard />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact card — the way to actually get an upgrade
// ─────────────────────────────────────────────────────────────────────────────
function ContactCard() {
  const { t } = useT();
  const { copied, copy: copyText } = useCopy();

  const copyBtn = (key: string, value: string) => (
    <button
      type="button"
      onClick={() => copyText(key, value)}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
      style={{ background: copied === key ? "#FFC145" : "rgba(255,255,255,0.14)", color: copied === key ? "#3a3d6e" : "#fff" }}
      aria-label={`${t(copy.copy)} ${value}`}
    >
      {copied === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied === key ? t(copy.copied) : t(copy.copy)}
    </button>
  );

  const rowStyle = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)" } as const;
  const selectable = { userSelect: "text", WebkitUserSelect: "text" } as const;

  return (
    <Reveal>
      <div
        className="spotlight relative rounded-3xl p-5 sm:p-10 overflow-hidden shadow-2xl"
        onMouseMove={trackPointer}
        style={{
          background: "linear-gradient(135deg, #3a3d6e 0%, #5B5F97 100%)",
          ["--spot" as string]: "rgba(255,193,69,0.16)",
        }}
      >
        <Starfield />
        <div className="animate-blob-b absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "#FFC145" }} aria-hidden />

        <div className="relative">
          <div className="text-center mb-7">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4"
              style={{ background: "#FFC145", color: "#3a3d6e" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t(copy.contactBadge)}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 text-balance"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              {t(copy.contactH2)}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              {t(copy.contactLead)}
            </p>
          </div>

          {/* 3 steps */}
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-7">
            {copy.contactSteps.map((s, i) => (
              <li key={i} className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left" style={rowStyle}>
                <span className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold"
                  style={{ background: "#FF6B6C", color: "#fff" }}>
                  {i + 1}
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-white leading-snug">{t(s)}</span>
              </li>
            ))}
          </ol>

          {/* Channels */}
          <div className="flex flex-col gap-3">
            {/* WeChat */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-4 py-3.5 sm:px-5" style={rowStyle}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: "#07C160" }}>
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{t(copy.wechatLabel)}</p>
                  <p className="font-bold text-base text-white break-all" style={selectable}>{CONTACT.wechat}</p>
                </div>
              </div>
              {copyBtn("wechat", CONTACT.wechat)}
            </div>

            {/* Instagram */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-4 py-3.5 sm:px-5" style={rowStyle}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#FFC145,#FF6B6C 60%,#5B5F97)" }}>
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Instagram</p>
                  <p className="font-bold text-base text-white break-all" style={selectable}>@{CONTACT.instagram}</p>
                </div>
              </div>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.14)" }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t(copy.openInstagram)}
              </a>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-4 py-3.5 sm:px-5" style={rowStyle}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: "#FFB5B4" }}>
                  <Mail className="h-5 w-5" style={{ color: "#3a3d6e" }} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{t(copy.emailLabel)}</p>
                  <p className="font-bold text-sm sm:text-base text-white break-all" style={selectable}>{CONTACT.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {copyBtn("email", CONTACT.email)}
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("SUMMER SELECT full access")}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
                  style={{ background: "#FFC145", color: "#3a3d6e" }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t(copy.sendEmail)}
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            {t(copy.contactFoot)}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
