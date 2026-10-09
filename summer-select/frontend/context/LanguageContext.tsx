"use client";

/**
 * Global bilingual context for Summer Select.
 *
 * Provides a `lang` state ('en' | 'zh') and a `t(base)` helper that appends
 * the correct suffix to any bilingual database column name.
 *
 * Example:
 *   t('name')          → 'name_en'   (when lang === 'en')
 *   t('name')          → 'name_zh'   (when lang === 'zh')
 *   program[t('name')] → program.name_en | program.name_zh
 *
 * Persistence:
 *   - Language preference is stored in localStorage and as a `lang` cookie so
 *     Server Components can read it via next/headers cookies().
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Lang } from "@/lib/database.types";

interface LanguageContextValue {
  /** Current active language. */
  lang: Lang;
  /** Update the active language and persist the preference. */
  setLang: (lang: Lang) => void;
  /**
   * Returns the language-suffixed column key.
   * @param base - Column base name, e.g. 'name', 'collin_rationale'
   * @returns e.g. 'name_en' or 'name_zh'
   */
  t: (base: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (base) => `${base}_en`,
});

interface LanguageProviderProps {
  children: React.ReactNode;
  /**
   * Server-provided initial language read from the `lang` cookie.
   * Prevents a flash of incorrect language on first render.
   */
  initialLang?: Lang;
}

export function LanguageProvider({
  children,
  initialLang = "en",
}: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Sync from localStorage on mount (handles direct URL navigation)
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "zh") {
      // localStorage is unavailable during SSR, so this can only run after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    // Persist for client-side revisits
    localStorage.setItem("lang", newLang);
    // Persist for Server Components on the next request
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (base: string): string => `${base}_${lang}`;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Consume the language context from any Client Component.
 * Must be used inside a <LanguageProvider> tree.
 */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
