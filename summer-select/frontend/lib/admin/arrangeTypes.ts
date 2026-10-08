/** Shapes shared by the drag-and-drop "Arrange" screens (safe for client code). */

export type ArrangeKind = "essays" | "interviews";

export interface ArrangeItem {
  id: string;
  title: string;
  /** Small labels shown under the title (counts, category, draft…). */
  badges: { text: string; tone: "plain" | "warn" }[];
  /** Where "Edit" goes. */
  href: string;
}

export interface ArrangeGroup {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  items: ArrangeItem[];
}

export interface ArrangeConfig {
  kind: ArrangeKind;
  title: string;
  description: string;
  groupNoun: string;
  groupNounPlural: string;
  itemNoun: string;
  itemNounPlural: string;
}

export const ARRANGE_CONFIGS: Record<ArrangeKind, ArrangeConfig> = {
  essays: {
    kind: "essays",
    title: "Arrange essays page",
    description:
      "Drag programs into the order students see them on the Essays page. Open a program to drag its prompts into order too.",
    groupNoun: "program",
    groupNounPlural: "programs",
    itemNoun: "prompt",
    itemNounPlural: "prompts",
  },
  interviews: {
    kind: "interviews",
    title: "Arrange interviews page",
    description:
      "Drag interview guides into the order students see them. Open a guide to drag its questions into order too.",
    groupNoun: "guide",
    groupNounPlural: "guides",
    itemNoun: "question",
    itemNounPlural: "questions",
  },
};

export function isArrangeKind(value: string): value is ArrangeKind {
  return value === "essays" || value === "interviews";
}
