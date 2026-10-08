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
  // Admin area: the real admin check happens in app/admin/layout.tsx and in the
  // database (RLS); this just sends guests to the login page.
  "/admin",
];

/**
 * Two jobs:
 *  1. On EVERY page request, refresh the Supabase session if its access token
 *     has expired and persist the new cookies. Server Components can't write
 *     cookies, so without this a public page (e.g. the Program Directory) that
 *     reads the signed-in user would try to refresh mid-render and fail.
 *  2. On members-only routes, send guests to the login page.
 *
 * Note: This runs in the Edge Runtime.
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const path = req.nextUrl.pathname;
  const isProtected = PAID_FEATURE_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // If env vars aren't configured, protected routes fail closed (send user to
  // login); public routes just render.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isProtected) return res;
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
        // Update the request cookies (so Server Components in this same
        // request see the fresh token) and the response cookies (so the
        // browser stores it).
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && isProtected) {
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
  // Every page and API route except static assets, so sessions are refreshed
  // everywhere (see above).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)",
  ],
};
