"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { AuthCardShell } from "@/components/auth/AuthCardShell";

/**
 * Password reset page — reached after the user clicks the Supabase-sent
 * reset link. The auth/callback route has already exchanged the code for a
 * valid session by the time the user lands here.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    const supabase = supabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    router.push("/reset-password/success");
  }

  return (
    <AuthCardShell showBrandHeader={false}>
      <div className="p-8">
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
            style={{ background: "var(--color-brand-50)" }}
          >
            <KeyRound className="h-7 w-7" style={{ color: "var(--color-brand-500)" }} />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--color-brand-700)" }}>
            Set a new password
          </h2>
          <p className="text-sm text-slate-500">
            Choose a strong password for your account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--color-brand-700)" }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl bg-white placeholder:text-slate-400 transition focus:outline-none"
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
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--color-brand-700)" }}
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white placeholder:text-slate-400 transition focus:outline-none"
                    style={{
                      border: mismatch
                        ? "1.5px solid #f87171"
                        : "1.5px solid var(--color-brand-100)",
                      color: "var(--color-brand-700)",
                    }}
                    onFocus={(e) => {
                      if (!mismatch) {
                        e.currentTarget.style.borderColor = "var(--color-brand-500)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,95,151,0.12)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!mismatch) {
                        e.currentTarget.style.borderColor = "var(--color-brand-100)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  {mismatch && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting" || mismatch}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--color-brand-500)",
                    letterSpacing: "0.04em",
                    boxShadow: "0 2px 12px rgba(91,95,151,0.35)",
                  }}
                >
                {status === "submitting" ? "Updating…" : "Update Password"}
              </button>
            </form>
      </div>
    </AuthCardShell>
  );
}
