"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { clientFingerprint } from "@/lib/clientFingerprint";
import { validateReport, type ReportInput } from "@/lib/reports";

export type SubmitReportResult =
  | { ok: true }
  | { ok: false; error: string; field?: "message" | "email" };

/**
 * Stores a problem report from a visitor. Anyone may call this, signed in or
 * not; the database only lets them insert (never read) and limits how many
 * reports one visitor can send.
 */
export async function submitReport(input: ReportInput): Promise<SubmitReportResult> {
  const parsed = validateReport(input ?? { message: "" });
  if (!parsed.ok) return parsed;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("error_reports").insert({
    message: parsed.value.message,
    page_url: parsed.value.pageUrl,
    // Signed-in visitors are identified by their account email.
    reporter_email: user?.email ?? parsed.value.email,
    user_id: user?.id ?? null,
    client_id: await clientFingerprint(),
  });

  if (error) {
    if (error.code === "P0001") {
      return { ok: false, error: "You've sent several reports recently. Please try again in a little while." };
    }
    console.error("submitReport failed:", error.code, error.message);
    return { ok: false, error: "We couldn't send your report. Please try again." };
  }
  return { ok: true };
}
