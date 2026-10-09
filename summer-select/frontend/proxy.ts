import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { loginUrl, requiresLogin } from "@/lib/access";

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL(loginUrl(req.nextUrl.pathname), req.url));
}

/**
 * Two jobs:
 *  1. On EVERY page request, refresh the Supabase session if its access token
 *     has expired and persist the new cookies. Server Components can't write
 *     cookies, so without this a public page (e.g. the Program Directory) that
 *     reads the signed-in user would try to refresh mid-render and fail.
 *  2. On members-only routes, send guests to the login page.
 */
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const isProtected = requiresLogin(req.nextUrl.pathname);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // If env vars aren't configured, protected routes fail closed (send user to
  // login); public routes just render.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isProtected) return res;
    return redirectToLogin(req);
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
    return redirectToLogin(req);
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
