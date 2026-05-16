import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Protects routes that require auth.
 *
 * Note: This runs in the Edge Runtime.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Only protect these route prefixes.
  const protectedPrefixes = ["/dashboard", "/paywall"];
  const isProtected = protectedPrefixes.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  if (!isProtected) return res;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // If env vars aren't configured, fail closed (send user to login).
  if (!supabaseUrl || !supabaseAnonKey) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Update both request cookies (for current middleware execution)
          // and response cookies (to persist).
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/paywall/:path*"],
};
