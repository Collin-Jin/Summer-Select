"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Animated pill-style EN / 中文 language switcher.
 *
 * Renders a two-option pill with a sliding highlighted thumb that moves
 * between EN and 中文 with a spring easing. The active option text flips
 * color to contrast against the thumb.
 *
 * Safe to render in both desktop nav and mobile drawer.
 */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const switchTo = (next: "en" | "zh") => {
    if (next === lang) return;
    setLang(next);
    router.refresh();
  };

  const isZh = lang === "zh";

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className="relative flex items-center rounded-full p-[3px] select-none"
      style={{
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden="true"
        className="absolute top-[3px] bottom-[3px] rounded-full pointer-events-none"
        style={{
          left: "3px",
          width: "calc(50% - 3px)",
          background: isZh ? "var(--color-brand-accent)" : "rgba(255,255,255,0.93)",
          boxShadow: isZh
            ? "0 0 10px rgba(255,193,69,0.45), 0 1px 3px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.18)",
          transform: isZh ? "translateX(100%)" : "translateX(0%)",
          transition:
            "transform 320ms cubic-bezier(0.34,1.56,0.64,1), background 250ms ease, box-shadow 250ms ease",
        }}
      />

      {/* EN option */}
      <button
        onClick={() => switchTo("en")}
        className="relative z-10 flex-1 px-2 py-1 text-xs font-bold rounded-full"
        style={{
          color: !isZh ? "var(--color-brand-600)" : "rgba(255,255,255,0.5)",
          transition: "color 200ms ease",
          letterSpacing: "0.05em",
        }}
        aria-pressed={!isZh}
      >
        EN
      </button>

      {/* 中 option */}
      <button
        onClick={() => switchTo("zh")}
        className="relative z-10 flex-1 px-2 py-1 text-xs font-bold rounded-full"
        style={{
          color: isZh ? "var(--color-brand-700)" : "rgba(255,255,255,0.5)",
          transition: "color 200ms ease",
        }}
        aria-pressed={isZh}
      >
        中
      </button>
    </div>
  );
}
