import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabaseServer = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

  const cookieMethods = {
    get: async (name: string) => {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(name);
      return cookie?.value || null;
    },
    getAll: async () => {
      throw new Error("getAll is not supported in this environment.");
    },
    set: () => {
      throw new Error("Setting cookies is not supported in this environment.");
    },
    delete: () => {
      throw new Error("Deleting cookies is not supported in this environment.");
    },
  };

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieMethods,
  });
};
