"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible client component mounted inside the dashboard layout.
 * Polls /api/session-validate every `intervalMs` milliseconds. If the
 * server reports the ss_sid cookie no longer matches the active session
 * in the database (i.e. another device has logged in), the client
 * navigates to /login. Using a fetch + client-side push avoids the
 * crash that occurs when redirect() is called inside a server component
 * triggered by router.refresh().
 */
export function SessionWatcher({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/session-validate");
        const data: { valid: boolean; reason?: string } = await res.json();
        if (!data.valid) {
          // Hard navigation to the force-signout Route Handler so the
          // signOut + cookie clearing happens in the correct context. A client
          // transition (router.push) would not run the handler in the browser.
          const reason = encodeURIComponent(data.reason ?? "");
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/api/auth/force-signout?reason=${reason}`;
        }
      } catch {
        // Network error — fail open, do not log the user out.
      }
    };

    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
