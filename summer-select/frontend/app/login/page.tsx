"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { handleSignIn, handleSignUp } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Tab = "signin" | "signup";

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "var(--color-brand-500)",
        letterSpacing: "0.04em",
        boxShadow: "0 2px 12px rgba(91,95,151,0.35)",
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function DuplicateSessionAlert() {
  const params = useSearchParams();
  if (params.get("reason") !== "duplicate_session") return null;
  return (
    <div
      className="mb-5 px-4 py-3 rounded-xl border text-sm"
      style={{
        background: "#FFF8EC",
        borderColor: "#FFE4A0",
        color: "#92600A",
      }}
    >
      Your account was signed in on another device. Please sign in again to continue.
    </div>
  );
}

/**
 * Authentication page with tab-switched Sign In / Sign Up forms.
 * Redesigned with Summer Select brand colors.
 */
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 60%, #2a1f5e 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="mb-5">
            <p
              className="text-5xl font-extrabold tracking-tight leading-none uppercase"
              style={{
                fontFamily: "var(--font-syne, sans-serif)",
                color: "#FFFFFB",
                textShadow: "0 2px 20px rgba(0,0,0,0.25)",
                letterSpacing: "0.05em",
              }}
            >
              Summer<br />Select
            </p>
            <p
              className="text-sm font-semibold tracking-widest uppercase mt-2"
              style={{ color: "var(--color-brand-accent)", letterSpacing: "0.3em" }}
            >
              by Collin
            </p>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            The curated summer research program directory
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFB",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #EEEEF7" }}>
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={clsx(
                  "flex-1 py-3.5 text-sm font-semibold transition-all focus-visible:outline-none"
                )}
                style={
                  tab === t
                    ? {
                        color: "var(--color-brand-600)",
                        borderBottom: "2px solid var(--color-brand-500)",
                        background: "var(--color-brand-50)",
                      }
                    : { color: "#94a3b8" }
                }
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-8">
            <Suspense>
              <DuplicateSessionAlert />
            </Suspense>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form
              className="space-y-5"
              action={async (formData) => {
                setError(null);
                const result =
                  tab === "signin"
                    ? await handleSignIn(formData)
                    : await handleSignUp(formData);
                if (result?.error) setError(result.error);
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--color-brand-700)" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white placeholder:text-slate-400 transition focus:outline-none"
                  style={{
                    border: "1.5px solid var(--color-brand-100)",
                    color: "var(--color-brand-700)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-brand-500)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,95,151,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-brand-100)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--color-brand-700)" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white placeholder:text-slate-400 transition focus:outline-none"
                  style={{
                    border: "1.5px solid var(--color-brand-100)",
                    color: "var(--color-brand-700)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-brand-500)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,95,151,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-brand-100)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Minimum 8 characters"
                />
              </div>

              {tab === "signup" && (
                <p className="text-xs text-slate-400">
                  By creating an account you agree to our Terms of Service.
                  Access to the program directory requires a paid subscription.
                </p>
              )}

              <SubmitButton
                label={tab === "signin" ? "Sign In" : "Create Account"}
                pendingLabel="Working…"
              />
            </form>

            {/* Toggle tab link */}
            <p className="mt-5 text-center text-sm text-slate-400">
              {tab === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("signup");
                      setError(null);
                    }}
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: "var(--color-brand-500)" }}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("signin");
                      setError(null);
                    }}
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: "var(--color-brand-500)" }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Summer Select &copy; {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
