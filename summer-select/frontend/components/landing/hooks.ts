"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Bi } from "./copy";

/** Fires once when the element enters the viewport. */
export function useReveal(
  threshold = 0.12,
  rootMargin = "0px 0px -80px 0px"
): [ref: (el: HTMLDivElement | null) => void, visible: boolean] {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // A block taller than the viewport (e.g. stacked cards on a phone) can
        // never reach a high intersection ratio, so also accept "at least half
        // of the visible area is filled by this element".
        const fillsViewport =
          !!entry.rootBounds && entry.intersectionRect.height >= entry.rootBounds.height * 0.5;
        if (entry.isIntersecting && (entry.intersectionRatio >= threshold || fillsViewport)) {
          setVisible(true);
          io.disconnect();
        }
      },
      // Fine-grained thresholds so the callback keeps firing as the element scrolls.
      { threshold: Array.from({ length: 21 }, (_, n) => n / 20), rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, threshold, rootMargin]);
  return [setEl, visible];
}

/** Animates 0 → target with an ease-out curve once `trigger` flips true. */
export function useCountUp(target: number, duration = 1400, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return value;
}

/** Reveals text char by char with a natural cadence. */
export function useTypewriter(text: string, trigger: boolean, speed = 18) {
  const [shown, setShown] = useState(0);
  const [prevText, setPrevText] = useState(text);
  // Restart from the beginning when the text changes (e.g. language toggle).
  if (prevText !== text) {
    setPrevText(text);
    setShown(0);
  }

  useEffect(() => {
    if (!trigger) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      if (i >= text.length) return;
      i++;
      setShown(i);
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

  return { displayed: text.slice(0, shown), done: trigger && shown >= text.length };
}

/** Page scroll progress, 0–1. Updated in a scroll listener, not during render. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return progress;
}

/** Copies text and flips `copied` true for ~1.8s. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1800);
    return () => clearTimeout(id);
  }, [copied]);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
    } catch {
      /* Clipboard blocked: the value is still visible and selectable. */
    }
  };
  return { copied, copy };
}

/** Returns the active language plus a translator for `{ en, zh }` pairs. */
export function useT() {
  const { lang } = useLanguage();
  return { lang, t: (b: Bi) => b[lang] };
}
