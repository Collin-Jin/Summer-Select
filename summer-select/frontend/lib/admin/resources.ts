/**
 * Declarative description of every table the admin can edit.
 *
 * The admin UI (lists, forms, validation, server actions) is generated from
 * these definitions, so adding a column to Supabase only needs one new entry
 * in the matching `fields` array (plus a place for it in `sections`).
 *
 * This file is imported by both server and client code: keep it free of
 * server-only imports.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "int"
  | "decimal"
  | "bool" // required true/false (checkbox switch)
  | "tribool" // nullable boolean: not specified / yes / no
  | "date"
  | "tags" // text[]
  | "intset" // int[] picked from fixed options
  | "select";

export interface Option {
  value: string;
  label: string;
}

export type Values = Record<string, unknown>;

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  min?: number;
  /** Numbers: largest value. Text: longest allowed length. */
  max?: number;
  rows?: number;
  /** Fixed choices for `select` and `intset`. */
  options?: Option[];
  /** `select` whose choices are the records of another resource. */
  refResource?: string;
  /** Offer the values already used in this column as autocomplete hints. */
  suggest?: boolean;
  /** Also suggest values from another resource's column (e.g. program slugs). */
  suggestFrom?: { resource: string; column: string };
  /** Cannot be changed once the record exists (e.g. URL slugs). */
  immutable?: boolean;
  /** Text must look like a URL slug (lowercase letters, digits, dashes). */
  slug?: boolean;
  /** `url` fields may also be a site-relative path such as /logo.png. */
  allowRelative?: boolean;
  /** Pre-filled value for brand-new records. */
  default?: string | number | boolean | null;
}

/** A form row is one field, or an [English, Chinese] pair shown side by side. */
export type FormRow = string | [string, string];

export interface SectionDef {
  title: string;
  description?: string;
  rows: FormRow[];
}

export type ColumnKind = "text" | "clamp" | "bool" | "date" | "number" | "badge";

export interface ListColumn {
  key: string;
  label: string;
  kind?: ColumnKind;
}

export interface ChildDef {
  /** Resource key of the child records. */
  resource: string;
  /** Column on the child that points at this record. */
  field: string;
  /** Column on this record whose value the child stores (defaults to pk). */
  parentColumn?: string;
  title: string;
}

export interface ResourceDef {
  /** URL segment: /admin/<key> */
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  pk: string;
  fields: FieldDef[];
  sections: SectionDef[];
  columns: ListColumn[];
  searchColumns: string[];
  order: { column: string; ascending: boolean }[];
  hasPublished?: boolean;
  hasUpdatedAt?: boolean;
  /** Column other tables use to reference this resource (defaults to pk). */
  refValue?: string;
  /** Columns needed to build `optionLabel` / `title`. */
  labelColumns: string[];
  /** Human-readable name of a record. */
  title: (row: Values) => string;
  /** Child records are edited on their own pages and return to the parent. */
  parent?: { field: string; resource: string };
  children?: ChildDef[];
  /** Extra checks across several fields. Return `{ field: message }`. */
  crossValidate?: (values: Values) => Record<string, string>;
  /** Map a database row to form values / back. Defaults to identity. */
  fromRow?: (row: Values) => Values;
  toRow?: (values: Values) => Values;
  /** Columns to select for the list page (defaults to the list columns). */
  listSelect?: string[];
  /** Shown above the form. */
  note?: string;
  /** Drag-and-drop screen for ordering this resource, if it has one. */
  arrange?: "essays" | "interviews";
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const GRADE_OPTIONS: Option[] = [6, 7, 8, 9, 10, 11, 12].map((g) => ({
  value: String(g),
  label: `Grade ${g}`,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Programs
// ─────────────────────────────────────────────────────────────────────────────

const programs: ResourceDef = {
  key: "programs",
  table: "summer_programs",
  label: "Programs",
  singular: "program",
  description: "The Program Directory: every summer program shown on the site.",
  pk: "lid",
  refValue: "slug",
  hasPublished: true,
  hasUpdatedAt: true,
  labelColumns: ["slug", "name_en"],
  title: (r) => str(r.name_en) || str(r.slug),
  fields: [
    { name: "slug", label: "URL slug", type: "text", required: true, slug: true, immutable: true, placeholder: "e.g. ucsb-rmp", help: "Used in the program's web address. Lowercase letters, numbers and dashes. Cannot be changed after the program is created." },
    { name: "is_published", label: "Published", type: "bool", default: false, help: "Off = draft. Draft programs are hidden from everyone but you." },
    { name: "name_en", label: "Name (English)", type: "text", required: true },
    { name: "name_zh", label: "名称 (中文)", type: "text" },
    { name: "host_institution_en", label: "Host institution (English)", type: "text" },
    { name: "host_institution_zh", label: "主办机构 (中文)", type: "text" },
    { name: "location_city_en", label: "City (English)", type: "text" },
    { name: "location_city_zh", label: "城市 (中文)", type: "text" },
    { name: "location_state", label: "State / region", type: "text", suggest: true, placeholder: "e.g. CA" },
    { name: "program_url", label: "Program website", type: "url", placeholder: "https://…", help: "The “Apply” button links here." },
    { name: "logo_url", label: "Logo image URL", type: "url", allowRelative: true, placeholder: "https://…/logo.png" },
    { name: "primary_category_en", label: "Category (English)", type: "text", suggest: true, help: "Pick an existing category so filters stay tidy." },
    { name: "primary_category_zh", label: "类别 (中文)", type: "text", suggest: true },
    { name: "format_en", label: "Format (English)", type: "text", suggest: true, help: "e.g. In-person, Online, Hybrid." },
    { name: "format_zh", label: "形式 (中文)", type: "text", suggest: true },
    { name: "offered_disciplines_en", label: "Disciplines (English)", type: "tags", help: "Type a discipline and press Enter." },
    { name: "offered_disciplines_zh", label: "研究方向 (中文)", type: "tags", help: "输入后按回车添加。" },
    { name: "duration_weeks", label: "Duration (weeks)", type: "int", min: 1, max: 52 },
    { name: "application_open_date", label: "Applications open", type: "date" },
    { name: "priority_deadline", label: "Priority deadline", type: "date" },
    { name: "regular_deadline", label: "Regular deadline", type: "date", help: "Shown as the main deadline on the site." },
    { name: "is_rolling_admission", label: "Rolling admission", type: "tribool" },
    { name: "program_start_date", label: "Program starts", type: "date" },
    { name: "program_end_date", label: "Program ends", type: "date" },
    { name: "application_fee", label: "Application fee (USD)", type: "decimal", min: 0, help: "Enter 0 if applying is free; leave blank if unknown." },
    { name: "tuition_cost", label: "Tuition / cost (USD)", type: "decimal", min: 0, help: "Enter 0 if the program is free; leave blank if unknown." },
    { name: "financial_aid_available", label: "Financial aid available", type: "tribool" },
    { name: "is_paid_stipend", label: "Pays a stipend", type: "tribool" },
    { name: "stipend_amount", label: "Stipend amount (USD)", type: "decimal", min: 0 },
    { name: "eligible_grades", label: "Eligible grades", type: "intset", options: GRADE_OPTIONS },
    { name: "international_eligible", label: "International students eligible", type: "tribool" },
    { name: "minimum_gpa", label: "Minimum GPA", type: "decimal", min: 0, max: 5, help: "On a 4.0 scale. Leave blank for no minimum." },
    { name: "acceptance_rate", label: "Acceptance rate (%)", type: "decimal", min: 1.01, max: 100, help: "Enter a percentage above 1, e.g. 8 for 8%. (The site reads values of 1 or less as fractions.)" },
    { name: "requires_essay", label: "Requires an essay", type: "tribool" },
    { name: "essays_required_en", label: "Essay requirements (English)", type: "textarea", rows: 4 },
    { name: "essays_required_zh", label: "文书要求 (中文)", type: "textarea", rows: 4 },
    { name: "has_interview", label: "Has an interview", type: "tribool" },
    { name: "collin_rec_index", label: "Collin Index (1–10)", type: "int", min: 1, max: 10, help: "Public: shown on every program card. 8–10 = Tier 1, 6–7 = Tier 2, 1–5 = Tier 3." },
    { name: "collin_rationale_en", label: "Collin's analysis (English)", type: "textarea", rows: 6, help: "Visible to signed-in users (free and paid)." },
    { name: "collin_rationale_zh", label: "Collin 的评价 (中文)", type: "textarea", rows: 6 },
    { name: "collin_strategy_en", label: "Application strategy (English)", type: "textarea", rows: 6, help: "Visible to signed-in users (free and paid)." },
    { name: "collin_strategy_zh", label: "申请策略 (中文)", type: "textarea", rows: 6 },
  ],
  sections: [
    { title: "Basics", rows: ["slug", "is_published", ["name_en", "name_zh"], ["host_institution_en", "host_institution_zh"], ["location_city_en", "location_city_zh"], "location_state", "program_url", "logo_url"] },
    { title: "Classification", rows: [["primary_category_en", "primary_category_zh"], ["format_en", "format_zh"], ["offered_disciplines_en", "offered_disciplines_zh"], "duration_weeks"] },
    { title: "Timeline", rows: ["application_open_date", "priority_deadline", "regular_deadline", "is_rolling_admission", "program_start_date", "program_end_date"] },
    { title: "Costs & funding", rows: ["application_fee", "tuition_cost", "financial_aid_available", "is_paid_stipend", "stipend_amount"] },
    { title: "Requirements", rows: ["eligible_grades", "international_eligible", "minimum_gpa", "acceptance_rate", "requires_essay", ["essays_required_en", "essays_required_zh"], "has_interview"] },
    { title: "Collin's analysis", description: "The Collin Index is public. The analysis and strategy text is visible to signed-in users (free and paid); guests see a blurred preview.", rows: ["collin_rec_index", ["collin_rationale_en", "collin_rationale_zh"], ["collin_strategy_en", "collin_strategy_zh"]] },
  ],
  columns: [
    { key: "name_en", label: "Program" },
    { key: "host_institution_en", label: "Institution" },
    { key: "primary_category_en", label: "Category", kind: "badge" },
    { key: "regular_deadline", label: "Deadline", kind: "date" },
    { key: "collin_rec_index", label: "Index", kind: "number" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  searchColumns: ["name_en", "name_zh", "host_institution_en", "slug", "primary_category_en"],
  order: [{ column: "name_en", ascending: true }],
  listSelect: ["lid", "slug", "name_en", "name_zh", "host_institution_en", "primary_category_en", "regular_deadline", "collin_rec_index", "is_published"],
  children: [
    { resource: "prompts", field: "program_slug", parentColumn: "slug", title: "Essay prompts for this program" },
  ],
  crossValidate: (v) => {
    const errors: Record<string, string> = {};
    const d = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : null);
    const open = d("application_open_date");
    const prio = d("priority_deadline");
    const reg = d("regular_deadline");
    const start = d("program_start_date");
    const end = d("program_end_date");
    if (prio && reg && prio > reg) errors.priority_deadline = "The priority deadline must be on or before the regular deadline.";
    if (open && prio && open > prio) errors.application_open_date = "Applications must open on or before the priority deadline.";
    else if (open && !prio && reg && open > reg) errors.application_open_date = "Applications must open on or before the deadline.";
    if (start && end && end < start) errors.program_end_date = "The program can't end before it starts.";
    if (v.is_paid_stipend === false && typeof v.stipend_amount === "number" && v.stipend_amount > 0) {
      errors.stipend_amount = "Remove the stipend amount, or set “Pays a stipend” to Yes.";
    }
    return errors;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Essay prompts
// ─────────────────────────────────────────────────────────────────────────────

const prompts: ResourceDef = {
  key: "prompts",
  table: "summer_program_prompts",
  label: "Essay prompts",
  singular: "essay prompt",
  description: "The essay questions each program asks. Example essays are attached to a prompt.",
  pk: "id",
  hasPublished: true,
  hasUpdatedAt: true,
  labelColumns: ["program_slug", "prompt_en"],
  title: (r) => clip(str(r.prompt_en), 70) || "Untitled prompt",
  parent: { field: "program_slug", resource: "programs" },
  fields: [
    { name: "program_slug", label: "Program", type: "select", required: true, refResource: "programs", immutable: true, help: "The program this prompt belongs to. Cannot be changed later." },
    { name: "prompt_en", label: "Prompt (English)", type: "textarea", required: true, rows: 4 },
    { name: "prompt_zh", label: "题目 (中文)", type: "textarea", rows: 4 },
    { name: "is_published", label: "Published", type: "bool", default: true },
  ],
  sections: [
    { title: "Prompt", rows: ["program_slug", ["prompt_en", "prompt_zh"]] },
    { title: "Display", description: "New prompts go to the end of their program. Change the order with “Arrange essays page” (drag and drop).", rows: ["is_published"] },
  ],
  columns: [
    { key: "program_slug", label: "Program", kind: "badge" },
    { key: "prompt_en", label: "Prompt", kind: "clamp" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  searchColumns: ["program_slug", "prompt_en", "prompt_zh"],
  order: [
    { column: "program_order", ascending: true },
    { column: "program_slug", ascending: true },
    { column: "order", ascending: true },
  ],
  listSelect: ["id", "program_slug", "prompt_en", "is_published"],
  arrange: "essays",
  children: [{ resource: "essays", field: "prompt_id", title: "Example essays for this prompt" }],
};

// ─────────────────────────────────────────────────────────────────────────────
// Example essays
// ─────────────────────────────────────────────────────────────────────────────

const essays: ResourceDef = {
  key: "essays",
  table: "program_example_essays",
  label: "Example essays",
  singular: "example essay",
  description: "Successful essays shown to members on the Essays page.",
  pk: "id",
  hasPublished: true,
  hasUpdatedAt: true,
  labelColumns: ["program_name", "year"],
  title: (r) => [str(r.program_name), r.year ? String(r.year) : ""].filter(Boolean).join(" · ") || "Example essay",
  parent: { field: "prompt_id", resource: "prompts" },
  fields: [
    { name: "prompt_id", label: "Essay prompt", type: "select", required: true, refResource: "prompts", help: "Which prompt this essay answers. This also decides which program it appears under." },
    { name: "program_name", label: "Program name shown", type: "text", help: "Leave blank to use the program's name automatically." },
    { name: "year", label: "Year", type: "int", min: 2000, max: 2100 },
    { name: "outcome", label: "Outcome", type: "text", suggest: true, default: "Accepted", help: "Shown as a badge, e.g. Accepted." },
    { name: "essay", label: "Essay", type: "textarea", required: true, rows: 18 },
    { name: "sort_order", label: "Order", type: "int", min: 0, default: 0, required: true, help: "Lower numbers appear first within the prompt." },
    { name: "is_published", label: "Published", type: "bool", default: true },
  ],
  sections: [
    { title: "Essay", rows: ["prompt_id", "program_name", ["year", "outcome"], "essay"] },
    { title: "Display", rows: ["sort_order", "is_published"] },
  ],
  columns: [
    { key: "program_name", label: "Program" },
    { key: "year", label: "Year", kind: "number" },
    { key: "outcome", label: "Outcome", kind: "badge" },
    { key: "essay", label: "Essay", kind: "clamp" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  searchColumns: ["program_name", "essay", "outcome"],
  order: [
    { column: "program_name", ascending: true },
    { column: "sort_order", ascending: true },
  ],
  listSelect: ["id", "program_name", "year", "outcome", "essay", "is_published"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Interview guides & questions
// ─────────────────────────────────────────────────────────────────────────────

const guides: ResourceDef = {
  key: "guides",
  table: "interview_guides",
  label: "Interview guides",
  singular: "interview guide",
  description: "One guide per program, each holding a list of practice questions.",
  pk: "id",
  hasPublished: true,
  hasUpdatedAt: true,
  labelColumns: ["program_name"],
  title: (r) => str(r.program_name) || "Interview guide",
  fields: [
    { name: "program_name", label: "Program name", type: "text", required: true },
    { name: "program_slug", label: "Program slug", type: "text", required: true, suggest: true, suggestFrom: { resource: "programs", column: "slug" }, help: "Short identifier for the program, e.g. ucsb-rmp." },
    { name: "format_note", label: "Interview format note (English)", type: "textarea", rows: 4, help: "How the interview works: length, who interviews, style." },
    { name: "format_note_zh", label: "面试形式说明 (中文)", type: "textarea", rows: 4 },
    { name: "is_published", label: "Published", type: "bool", default: true },
  ],
  sections: [
    { title: "Guide", rows: [["program_name", "program_slug"], ["format_note", "format_note_zh"]] },
    { title: "Display", description: "New guides go to the end. Change the order with “Arrange interviews page” (drag and drop).", rows: ["is_published"] },
  ],
  columns: [
    { key: "program_name", label: "Program" },
    { key: "program_slug", label: "Slug", kind: "badge" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  searchColumns: ["program_name", "program_slug"],
  order: [{ column: "sort_order", ascending: true }],
  listSelect: ["id", "program_name", "program_slug", "is_published"],
  arrange: "interviews",
  children: [{ resource: "questions", field: "guide_id", title: "Questions in this guide" }],
};

const questions: ResourceDef = {
  key: "questions",
  table: "interview_questions",
  label: "Interview questions",
  singular: "interview question",
  description: "Practice questions inside an interview guide.",
  pk: "id",
  hasPublished: true,
  labelColumns: ["question"],
  title: (r) => clip(str(r.question), 70) || "Question",
  parent: { field: "guide_id", resource: "guides" },
  fields: [
    { name: "guide_id", label: "Guide", type: "select", required: true, refResource: "guides", immutable: true, help: "The interview guide this question belongs to." },
    { name: "question", label: "Question (English)", type: "textarea", required: true, rows: 3 },
    { name: "question_zh", label: "问题 (中文)", type: "textarea", rows: 3 },
    { name: "tips", label: "Answering tips (English)", type: "textarea", rows: 5 },
    { name: "tips_zh", label: "回答技巧 (中文)", type: "textarea", rows: 5 },
    { name: "category", label: "Category", type: "text", suggest: true, placeholder: "e.g. motivations", help: "Questions are grouped by category on the site." },
    { name: "is_published", label: "Published", type: "bool", default: true },
  ],
  sections: [
    { title: "Question", rows: ["guide_id", ["question", "question_zh"], ["tips", "tips_zh"]] },
    { title: "Display", description: "New questions go to the end of their guide. Change the order with “Arrange interviews page” (drag and drop).", rows: ["category", "is_published"] },
  ],
  columns: [
    { key: "question", label: "Question", kind: "clamp" },
    { key: "category", label: "Category", kind: "badge" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  searchColumns: ["question", "question_zh", "category"],
  order: [{ column: "sort_order", ascending: true }],
  listSelect: ["id", "question", "category", "is_published"],
  arrange: "interviews",
};

// ─────────────────────────────────────────────────────────────────────────────
// AI reference documents (RAG)
// ─────────────────────────────────────────────────────────────────────────────

const documents: ResourceDef = {
  key: "documents",
  table: "program_documents",
  label: "AI reference essays",
  singular: "reference essay",
  description: "The essays the AI Essay Evaluator compares students' drafts against.",
  pk: "id",
  labelColumns: ["metadata"],
  title: (r) => {
    const m = (r.metadata ?? {}) as Values;
    return str(r.program) || str(m.program) || "Reference essay";
  },
  note: "When you save, the AI search index for this essay is rebuilt automatically — nothing else to do.",
  fields: [
    { name: "program", label: "Program", type: "text", required: true, placeholder: "e.g. MIT RSI" },
    { name: "prompt", label: "Prompt it answers", type: "text", placeholder: "e.g. Describe your research interests." },
    { name: "content", label: "Essay text", type: "textarea", required: true, rows: 18, max: 24000, help: "Paste the full essay (up to 24,000 characters). The AI uses this text as a benchmark for feedback." },
  ],
  sections: [{ title: "Reference essay", rows: ["program", "prompt", "content"] }],
  columns: [
    { key: "program", label: "Program" },
    { key: "prompt", label: "Prompt", kind: "clamp" },
    { key: "content", label: "Essay", kind: "clamp" },
  ],
  searchColumns: ["content"],
  order: [{ column: "id", ascending: true }],
  listSelect: ["id", "content", "metadata"],
  fromRow: (row) => {
    const m = (row.metadata ?? {}) as Values;
    return { id: row.id, program: str(m.program), prompt: str(m.prompt), content: str(row.content) };
  },
  toRow: (v) => ({
    content: v.content,
    metadata: { program: v.program ?? "", prompt: v.prompt ?? "" },
  }),
};

export const RESOURCES: Record<string, ResourceDef> = {
  programs,
  prompts,
  essays,
  guides,
  questions,
  documents,
};

/** Resources shown in the admin sidebar (questions live inside guides). */
export const NAV_RESOURCE_KEYS = ["programs", "prompts", "essays", "guides", "documents"] as const;

export function getResource(key: string): ResourceDef | null {
  return Object.prototype.hasOwnProperty.call(RESOURCES, key) ? RESOURCES[key] : null;
}

export function getField(resource: ResourceDef, name: string): FieldDef {
  const field = resource.fields.find((f) => f.name === name);
  if (!field) throw new Error(`Unknown field "${name}" on resource "${resource.key}"`);
  return field;
}

/** The serialisable slice of a resource that client components need. */
export interface FormSpec {
  key: string;
  singular: string;
  label: string;
  note?: string;
  fields: FieldDef[];
  sections: SectionDef[];
}

export function toFormSpec(resource: ResourceDef): FormSpec {
  return {
    key: resource.key,
    singular: resource.singular,
    label: resource.label,
    note: resource.note,
    fields: resource.fields,
    sections: resource.sections,
  };
}

/** What a form input holds: text, a list (tags / checkboxes) or a switch. */
export type FieldValue = string | string[] | boolean;

/**
 * Starting values for the form. `row` is an existing record (edit), `presets`
 * are values passed in the URL when adding a child record (create).
 */
export function initialFormValues(
  fields: FieldDef[],
  row: Values | null,
  presets: Record<string, string> = {}
): Record<string, FieldValue> {
  const out: Record<string, FieldValue> = {};
  for (const f of fields) {
    const raw = row ? row[f.name] : presets[f.name] ?? f.default ?? null;
    switch (f.type) {
      case "bool":
        out[f.name] = raw === true || raw === "true";
        break;
      case "tribool":
        out[f.name] = raw === true || raw === "true" ? "true" : raw === false || raw === "false" ? "false" : "";
        break;
      case "tags":
      case "intset":
        out[f.name] = Array.isArray(raw) ? raw.map(String) : [];
        break;
      case "date":
        out[f.name] = typeof raw === "string" ? raw.slice(0, 10) : "";
        break;
      default:
        out[f.name] = raw === null || raw === undefined ? "" : String(raw);
    }
  }
  return out;
}
