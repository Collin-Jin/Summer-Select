"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { GraduationCap } from "lucide-react";
import { clsx } from "clsx";
import { handleSignIn, handleSignUp } from "./actions";

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
      className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Authentication page with tab-switched Sign In / Sign Up forms.
 * Uses Next.js Server Actions for form submission (handleSignIn, handleSignUp).
 * On success, the server action redirects to /dashboard where the is_paid gate
 * in the dashboard layout will further route to /paywall if needed.
 */
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 shadow-md mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Summer Select
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            The curated summer research program directory
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={clsx(
                  "flex-1 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none",
                  tab === t
                    ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-8">
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
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    tab === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  placeholder="Minimum 8 characters"
                />
              </div>

              {tab === "signup" && (
                <p className="text-xs text-slate-500">
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
            <p className="mt-5 text-center text-sm text-slate-500">
              {tab === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("signup");
                      setError(null);
                    }}
                    className="text-indigo-600 font-medium hover:text-indigo-700 underline-offset-2 hover:underline"
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
                    className="text-indigo-600 font-medium hover:text-indigo-700 underline-offset-2 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Summer Select &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
