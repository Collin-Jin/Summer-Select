import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Hash of network address + browser; used only to rate-limit one visitor. */
export async function clientFingerprint(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const agent = h.get("user-agent") ?? "";
  if (!ip && !agent) return null;
  const salt = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "summer-select";
  return createHash("sha256").update(`${salt}|${ip}|${agent}`).digest("hex").slice(0, 32);
}
