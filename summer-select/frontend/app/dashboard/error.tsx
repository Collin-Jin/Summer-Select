"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Next.js App Router error boundary for the /dashboard segment.
 * Catches errors thrown during rendering within any dashboard route.
 * Provides a user-facing error card with reset and navigation options.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to error monitoring service in production
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="h-14 w-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-2">
        An unexpected error occurred while loading this page.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono mb-6">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
