import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

/**
 * Global 404 page for Summer Select.
 * Rendered by Next.js whenever a route cannot be matched.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-600 shadow-md mb-6">
          <GraduationCap className="h-9 w-9 text-white" />
        </div>
        <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
