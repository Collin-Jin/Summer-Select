import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Returns a singleton Supabase browser client typed against the Summer Select schema.
 * Safe to call from any Client Component — the instance is created once and reused.
 */
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function supabaseClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY."
    );
  }

  _client = createBrowserClient<Database>(url, key);
  return _client;
}
