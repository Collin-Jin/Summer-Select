import type { ReactNode } from "react";
import Link from "next/link";

interface AuthCardShellProps {
  children: ReactNode;
  /** Show full Summer Select brand header (login page style). Default true. */
  showBrandHeader?: boolean;
}

/**
 * Shared gradient background + card wrapper for auth pages.
 */
export function AuthCardShell({ children, showBrandHeader = true }: AuthCardShellProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 60%, #2a1f5e 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {showBrandHeader && (
          <div className="text-center mb-8">
            <Link href="/login" className="inline-block">
              <p
                className="text-5xl font-extrabold tracking-tight leading-none uppercase"
                style={{
                  fontFamily: "var(--font-syne, sans-serif)",
                  color: "#FFFFFB",
                  textShadow: "0 2px 20px rgba(0,0,0,0.25)",
                  letterSpacing: "0.05em",
                }}
              >
                Summer
                <br />
                Select
              </p>
              <p
                className="text-sm font-semibold tracking-widest uppercase mt-2"
                style={{ color: "var(--color-brand-accent)", letterSpacing: "0.3em" }}
              >
                by Collin
              </p>
            </Link>
          </div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFB",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          {children}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Summer Select &copy; {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
