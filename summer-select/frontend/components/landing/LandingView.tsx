"use client";

import { ScrollBar } from "./effects";
import { useScrollProgress } from "./hooks";
import { HeroSection, ProgramMarquee } from "./HeroSection";
import { FounderSection } from "./FounderSection";
import { CoachingStats, PlatformStats } from "./StatsSections";
import { ValueSection, ReasonsSection, StepsSection } from "./ReasonsSections";
import { AdCtaSection, PricingSection } from "./PricingSection";

/**
 * The public landing page. Each section lives in its own file; bilingual copy
 * is in `copy.ts` and the shared motion helpers are in `hooks.ts` / `effects.tsx`.
 */
export function LandingView({
  isSignedIn,
  programCount,
}: {
  isSignedIn: boolean;
  /** Live number of published programs. 0 hides the stat. */
  programCount: number;
}) {
  const progress = useScrollProgress();

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFB", fontFamily: "var(--font-sans, system-ui)" }}>
      <ScrollBar progress={progress} />
      <HeroSection isSignedIn={isSignedIn} programCount={programCount} />
      <ProgramMarquee />
      <FounderSection />
      <CoachingStats />
      <PlatformStats programCount={programCount} />
      <ValueSection />
      <ReasonsSection />
      <StepsSection />
      <AdCtaSection />
      <PricingSection />
    </div>
  );
}
