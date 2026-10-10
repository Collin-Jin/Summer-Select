"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { clientFingerprint } from "@/lib/clientFingerprint";
import {
  validateProgramRequest,
  type ProgramRequestField,
  type ProgramRequestInput,
} from "@/lib/programRequests";

export type SubmitProgramRequestResult =
  | { ok: true }
  | { ok: false; error: string; field?: ProgramRequestField };

/**
 * Stores a request for a program to be added to the directory. Anyone may call
 * this, signed in or not; the database only lets them insert (never read) and
 * limits how many requests one visitor can send.
 */
export async function submitProgramRequest(
  input: ProgramRequestInput
): Promise<SubmitProgramRequestResult> {
  const parsed = validateProgramRequest(input ?? { programName: "" });
  if (!parsed.ok) return parsed;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("program_requests").insert({
    program_name: parsed.value.programName,
    program_url: parsed.value.programUrl,
    notes: parsed.value.notes,
    // Signed-in visitors are identified by their account email.
    requester_email: user?.email ?? parsed.value.email,
    user_id: user?.id ?? null,
    client_id: await clientFingerprint(),
  });

  if (error) {
    if (error.code === "P0001") {
      return {
        ok: false,
        error: "You've sent several requests recently. Please try again tomorrow.",
      };
    }
    console.error("submitProgramRequest failed:", error.code, error.message);
    return { ok: false, error: "We couldn't send your request. Please try again." };
  }
  return { ok: true };
}
