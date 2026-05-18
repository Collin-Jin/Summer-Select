/**
 * Hand-authored TypeScript type definitions for the Summer Select Supabase database.
 * Mirrors the PostgreSQL schema exactly, including bilingual column naming conventions.
 *
 * Primary table: `summer_programs` (PK: `lid` UUID)
 * Supporting tables: `profiles` (PK: `id`), `favorites` (PK: `id`)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      /**
       * Core program directory — 50 rows, RLS restricts SELECT to paid users.
       */
      summer_programs: {
        Row: {
          // ── System & Metadata ──────────────────────────────────────────
          lid: string;
          created_at: string | null;
          updated_at: string | null;
          /** If FALSE the program is hidden (draft mode). */
          is_published: boolean | null;
          /** URL-friendly identifier e.g. "ucsb-rmp". Unique. */
          slug: string;

          // ── Program Identity & Branding ────────────────────────────────
          name_en: string;
          name_zh: string | null;
          host_institution_en: string | null;
          host_institution_zh: string | null;
          location_city_en: string | null;
          location_city_zh: string | null;
          location_state: string | null;
          program_url: string | null;
          logo_url: string | null;

          // ── Logistics & Categorization ─────────────────────────────────
          primary_category_en: string | null;
          primary_category_zh: string | null;
          offered_disciplines_en: string[] | null;
          offered_disciplines_zh: string[] | null;
          format_en: string | null;
          format_zh: string | null;
          duration_weeks: number | null;

          // ── Admissions Timeline ────────────────────────────────────────
          application_open_date: string | null;
          priority_deadline: string | null;
          regular_deadline: string | null;
          is_rolling_admission: boolean | null;
          program_start_date: string | null;
          program_end_date: string | null;

          // ── Financials & Costs ─────────────────────────────────────────
          application_fee: number | null;
          tuition_cost: number | null;
          financial_aid_available: boolean | null;
          is_paid_stipend: boolean | null;
          stipend_amount: number | null;

          // ── Requirements & Selectivity ─────────────────────────────────
          eligible_grades: number[] | null;
          international_eligible: boolean | null;
          minimum_gpa: number | null;
          acceptance_rate: number | null;
          requires_essay: boolean | null;
          essays_required_en: string | null;
          essays_required_zh: string | null;
          has_interview: boolean | null;

          // ── Proprietary Analysis (The "Collin Index") ─────────────────
          difficulty_level_en: string | null;
          difficulty_level_zh: string | null;
          /** Integer score 1–10. CHECK constraint enforced at DB level. */
          collin_rec_index: number | null;
          collin_rationale_en: string | null;
          collin_rationale_zh: string | null;
          collin_strategy_en: string | null;
          collin_strategy_zh: string | null;
        };
        Insert: {
          lid?: string;
          slug: string;
          name_en: string;
          name_zh?: string | null;
          host_institution_en?: string | null;
          host_institution_zh?: string | null;
          location_city_en?: string | null;
          location_city_zh?: string | null;
          location_state?: string | null;
          program_url?: string | null;
          logo_url?: string | null;
          primary_category_en?: string | null;
          primary_category_zh?: string | null;
          offered_disciplines_en?: string[] | null;
          offered_disciplines_zh?: string[] | null;
          format_en?: string | null;
          format_zh?: string | null;
          duration_weeks?: number | null;
          application_open_date?: string | null;
          priority_deadline?: string | null;
          regular_deadline?: string | null;
          is_rolling_admission?: boolean | null;
          program_start_date?: string | null;
          program_end_date?: string | null;
          application_fee?: number | null;
          tuition_cost?: number | null;
          financial_aid_available?: boolean | null;
          is_paid_stipend?: boolean | null;
          stipend_amount?: number | null;
          eligible_grades?: number[] | null;
          international_eligible?: boolean | null;
          minimum_gpa?: number | null;
          acceptance_rate?: number | null;
          requires_essay?: boolean | null;
          essays_required_en?: string | null;
          essays_required_zh?: string | null;
          has_interview?: boolean | null;
          difficulty_level_en?: string | null;
          difficulty_level_zh?: string | null;
          collin_rec_index?: number | null;
          collin_rationale_en?: string | null;
          collin_rationale_zh?: string | null;
          collin_strategy_en?: string | null;
          collin_strategy_zh?: string | null;
          is_published?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["summer_programs"]["Insert"]>;
        Relationships: [];
      };

      /**
       * One row per auth.user — stores payment status.
       * PK `id` is a FK to auth.users.id.
       */
      profiles: {
        Row: {
          id: string;
          is_paid: boolean | null;
          active_session_id: string | null;
        };
        Insert: {
          id: string;
          is_paid?: boolean | null;
          active_session_id?: string | null;
        };
        Update: {
          is_paid?: boolean | null;
          active_session_id?: string | null;
        };
        Relationships: [];
      };

      /**
       * Example essays for summer programs — fetched by the essays page.
       * RLS restricts SELECT to paid users.
       */
      example_essays: {
        Row: {
          id: string;
          program_name: string;
          program_slug: string;
          prompt: string;
          prompt_zh: string | null;
          essay: string;
          essay_zh: string | null;
          word_count: number | null;
          year: number | null;
          outcome: string | null;
          sort_order: number | null;
          is_published: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          program_name: string;
          program_slug: string;
          prompt: string;
          prompt_zh?: string | null;
          essay: string;
          essay_zh?: string | null;
          word_count?: number | null;
          year?: number | null;
          outcome?: string | null;
          sort_order?: number | null;
          is_published?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["example_essays"]["Insert"]>;
        Relationships: [];
      };

      /**
       * Interview preparation guides (one row per program).
       * RLS restricts SELECT to paid users.
       */
      interview_guides: {
        Row: {
          id: string;
          program_name: string;
          program_slug: string;
          format_note: string | null;
          format_note_zh: string | null;
          sort_order: number | null;
          is_published: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          program_name: string;
          program_slug: string;
          format_note?: string | null;
          format_note_zh?: string | null;
          sort_order?: number | null;
          is_published?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["interview_guides"]["Insert"]>;
        Relationships: [];
      };

      /**
       * Individual interview questions linked to a guide.
       * RLS restricts SELECT to paid users.
       */
      interview_questions: {
        Row: {
          id: string;
          guide_id: string;
          question: string;
          question_zh: string | null;
          tips: string | null;
          tips_zh: string | null;
          sample_answer: string | null;
          sample_answer_zh: string | null;
          category: string | null;
          sort_order: number | null;
          is_published: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          guide_id: string;
          question: string;
          question_zh?: string | null;
          tips?: string | null;
          tips_zh?: string | null;
          sample_answer?: string | null;
          sample_answer_zh?: string | null;
          category?: string | null;
          sort_order?: number | null;
          is_published?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["interview_questions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "interview_questions_guide_id_fkey";
            columns: ["guide_id"];
            referencedRelation: "interview_guides";
            referencedColumns: ["id"];
          }
        ];
      };

      /**
       * User-saved program bookmarks.
       * RLS: each user can only read and write their own rows.
       */
      favorites: {
        Row: {
          id: string;
          user_id: string;
          /** References summer_programs.lid */
          program_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
  };
}

// ── Convenience type aliases ─────────────────────────────────────────────────

/** A fully-hydrated row from the `summer_programs` table. */
export type SummerProgram =
  Database["public"]["Tables"]["summer_programs"]["Row"];

/** A row from the `profiles` table. */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** A row from the `favorites` table. */
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];

/** A row from the `example_essays` table. */
export type ExampleEssay = Database["public"]["Tables"]["example_essays"]["Row"];

/** A row from the `interview_guides` table. */
export type InterviewGuide = Database["public"]["Tables"]["interview_guides"]["Row"];

/** A row from the `interview_questions` table. */
export type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];

/** An interview guide with its questions hydrated. */
export type InterviewGuideWithQuestions = InterviewGuide & {
  interview_questions: InterviewQuestion[];
};

/** Language codes supported by the app. */
export type Lang = "en" | "zh";
