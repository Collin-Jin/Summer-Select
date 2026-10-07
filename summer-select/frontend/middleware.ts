import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Members-only features. Guests are sent to the login page; the payment check
 * happens server-side in app/dashboard/(paid)/layout.tsx.
 *
 * Everything else — the landing page, the Program Directory (/dashboard and
 * /dashboard/program/*) and the auth pages — is public.
 */
const PAID_FEATURE_PREFIXES = [
  "/dashboard/my-list",
  "/dashboard/essays",
  "/dashboard/evaluate",
  "/dashboard/interviews",
];

/**
 * Protects routes that require auth.
 *
 * Note: This runs in the Edge Runtime.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const isProtected = PAID_FEATURE_PREFIXES.some((p) => {
    const path = req.nextUrl.pathname;
    return path === p || path.startsWith(`${p}/`);
  });
  if (!isProtected) return res;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // If env vars aren't configured, fail closed (send user to login).
  if (!supabaseUrl || !supabaseAnonKey) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("reason", "login_required");
    redirectUrl.searchParams.set("next", req.nextUrl.pathname);
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
    redirectUrl.search = "";
    redirectUrl.searchParams.set("reason", "login_required");
    redirectUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/my-list/:path*",
    "/dashboard/essays/:path*",
    "/dashboard/evaluate/:path*",
    "/dashboard/interviews/:path*",
  ],
};
