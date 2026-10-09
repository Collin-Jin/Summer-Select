import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components and Server Actions.
 * Uses cookies() so auth persists across requests.
 */
export async function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY environment variables."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components are not allowed to write cookies, and Supabase
        // calls this from an async callback when it silently refreshes an
        // expired token. An uncaught throw there is an unhandled rejection that
        // crashes the Node process. It is safe to ignore: middleware.ts
        // refreshes the session on every request and persists the cookies, and
        // Server Actions / Route Handlers (where writes are allowed) still work.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; see note above.
        }
      },
    },
  });
}
