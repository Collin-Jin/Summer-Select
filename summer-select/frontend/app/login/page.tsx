"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import {
  handleSignIn,
  handleSignUp,
  handleResendVerification,
  handleForgotPassword,
  handleResendPasswordReset,
} from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, ArrowLeft, RefreshCw, KeyRound, LogIn, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

type Tab = "signin" | "signup";
type SignUpState = "idle" | { stage: "verify_email"; email: string };
type CardView = "auth" | "forgot_password" | "forgot_password_sent";

function SubmitButton({
  label,
  pendingLabel,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
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

function LoginRequiredAlert() {
  const params = useSearchParams();
  if (params.get("reason") !== "login_required") return null;
  return (
    <div
      className="mb-5 px-4 py-3 rounded-xl border text-sm"
      style={{
        background: "#EEEEF7",
        borderColor: "#B8B8D1",
        color: "var(--color-brand-700)",
      }}
    >
      Please log in to continue. New here? Create a free account first.
    </div>
  );
}

/** Carries the page the visitor originally wanted through the login form. */
function NextField() {
  const params = useSearchParams();
  const next = params.get("next");
  if (!next) return null;
  return <input type="hidden" name="next" value={next} />;
}

function LinkExpiredAlert() {
  const params = useSearchParams();
  if (params.get("reason") !== "link_expired") return null;
  return (
    <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      This link has expired or was already used. If you already confirmed your email, just sign in below.
      Otherwise request a new verification or reset email, and open the newest one.
    </div>
  );
}

function DeviceLockedAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="mb-5 rounded-2xl overflow-hidden text-sm"
      style={{
        border: "1.5px solid #E4E4F0",
        boxShadow: "0 4px 24px rgba(91,95,151,0.10)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #3a3d6e 0%, #5B5F97 100%)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span style={{ fontSize: 15 }}>⚠️</span>
          </div>
          <div>
            <p
              className="font-extrabold text-base leading-snug"
              style={{ color: "#FFFFFB", fontFamily: "var(--font-syne, sans-serif)" }}
            >
              Account Access Restricted
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
              This account is already registered to another device.
            </p>
          </div>
        </div>
      </div>

      {/* Policy reminder */}
      <div
        className="px-5 py-4"
        style={{ background: "#FFF8EC", borderBottom: "1px solid #FFE4A0" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: "#92600A" }}
        >
          Important Reminder
        </p>
        <p className="leading-relaxed" style={{ color: "#7A4F00", fontSize: 13 }}>
          Sharing your account login credentials is <strong>strictly prohibited</strong>.
          Any further attempts to share account access may result in the{" "}
          <strong>suspension or termination</strong> of your access to our services,
          without refund. We appreciate your cooperation and ask that you refrain
          from doing this again.
        </p>
      </div>

      {/* Contact + dismiss */}
      <div className="px-5 py-4 flex flex-col gap-2.5" style={{ background: "#FFFFFB" }}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          To transfer access to this device, contact:
        </p>
        <div className="flex items-center gap-2" style={{ color: "#3a3d6e" }}>
          <MessageCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-brand-500)" }} />
          <span>WeChat: <strong>collinxuezhang</strong></span>
        </div>
        <a
          href="https://instagram.com/collin.jin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline underline-offset-2"
          style={{ color: "#3a3d6e" }}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-brand-500)" }} />
          <span>Instagram: <strong>@collin.jin</strong></span>
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 text-xs text-slate-400 hover:text-slate-500 transition-colors text-left"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

/**
 * Callout shown when the user tries to create an account with an email that
 * already exists. Provides a one-click shortcut to switch to Sign In.
 */
function AlreadyRegisteredCallout({
  email,
  onSignInClick,
}: {
  email: string;
  onSignInClick: () => void;
}) {
  return (
    <div
      className="mb-5 rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-brand-100)" }}
    >
      <div
        className="px-4 py-3"
        style={{ background: "var(--color-brand-50)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-brand-700)" }}>
          This email already has an account.
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-brand-600)" }}>
          {email}
        </p>
      </div>
      <button
        type="button"
        onClick={onSignInClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:opacity-90"
        style={{
          background: "var(--color-brand-500)",
          color: "#FFFFFB",
        }}
      >
        <LogIn className="h-4 w-4" />
        Sign in instead
      </button>
    </div>
  );
}

/**
 * Authentication page with tab-switched Sign In / Sign Up forms.
 * Redesigned with Summer Select brand colors.
 */
export default function LoginPage() {
  // useSearchParams needs a Suspense boundary during static rendering.
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

function NameFields() {
  const fields = [
    { id: "firstName", label: "First name", autoComplete: "given-name", placeholder: "First name" },
    { id: "lastName", label: "Last name", autoComplete: "family-name", placeholder: "Last name" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.id}>
          <label
            htmlFor={f.id}
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--color-brand-700)" }}
          >
            {f.label}
          </label>
          <input
            id={f.id}
            name={f.id}
            type="text"
            autoComplete={f.autoComplete}
            required
            maxLength={60}
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
            placeholder={f.placeholder}
          />
        </div>
      ))}
    </div>
  );
}

function LoginPageContent() {
  const initialParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(initialParams.get("tab") === "signup" ? "signup" : "signin");
  const [error, setError] = useState<string | null>(null);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const [signUpState, setSignUpState] = useState<SignUpState>("idle");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [cardView, setCardView] = useState<CardView>("auth");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "error">("idle");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [resetResendStatus, setResetResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resetResendError, setResetResendError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const passwordMismatch =
    tab === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  function switchToSignIn(prefillEmail?: string) {
    setTab("signin");
    setError(null);
    setDeviceLocked(false);
    setDuplicateEmail(null);
    if (prefillEmail) setForgotEmail(prefillEmail);
  }

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
          {/* ── Email verification panel ──────────────────────────────────── */}
          {signUpState !== "idle" ? (
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
                  style={{ background: "var(--color-brand-50)" }}
                >
                  <Mail className="h-7 w-7" style={{ color: "var(--color-brand-500)" }} />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--color-brand-700)" }}
                >
                  Check your inbox
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  We sent a verification link to
                </p>
                <p
                  className="text-sm font-semibold mt-1 break-all"
                  style={{ color: "var(--color-brand-600)" }}
                >
                  {signUpState.email}
                </p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Click the link in the email to activate your account, then sign in.{" "}
                  <strong className="font-semibold text-slate-600">
                    Check your spam folder if you don&apos;t see it.
                  </strong>
                </p>
              </div>

              {resendStatus === "sent" && (
                <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-center"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0", color: "#166534" }}>
                  A new verification email is on its way. Open the newest one; links in older emails may no longer work.
                </div>
              )}
              {resendStatus === "error" && resendError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-center text-red-700">
                  {resendError}
                </div>
              )}

              <button
                type="button"
                disabled={resendStatus === "sending" || resendStatus === "sent"}
                onClick={async () => {
                  setResendStatus("sending");
                  setResendError(null);
                  const result = await handleResendVerification(signUpState.email);
                  if ("error" in result) {
                    setResendStatus("error");
                    setResendError(result.error ?? null);
                  } else {
                    setResendStatus("sent");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4"
                style={{
                  background: "var(--color-brand-50)",
                  color: "var(--color-brand-600)",
                  border: "1.5px solid var(--color-brand-100)",
                }}
              >
                <RefreshCw className={clsx("h-4 w-4", resendStatus === "sending" && "animate-spin")} />
                {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "Email Sent" : "Resend Verification Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSignUpState("idle");
                  setTab("signin");
                  setResendStatus("idle");
                  setResendError(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>

          /* ── Forgot password panel ────────────────────────────────────── */
          ) : cardView === "forgot_password" ? (
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
                  style={{ background: "var(--color-brand-50)" }}
                >
                  <KeyRound className="h-7 w-7" style={{ color: "var(--color-brand-500)" }} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--color-brand-700)" }}>
                  Reset your password
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              {forgotStatus === "error" && forgotError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {forgotError}
                </div>
              )}

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotStatus("sending");
                  setForgotError(null);
                  const result = await handleForgotPassword(forgotEmail);
                  if ("error" in result) {
                    setForgotStatus("error");
                    setForgotError(result.error ?? null);
                  } else {
                    setCardView("forgot_password_sent");
                  }
                }}
              >
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--color-brand-700)" }}
                  >
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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

                <button
                  type="submit"
                  disabled={forgotStatus === "sending"}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--color-brand-500)",
                    letterSpacing: "0.04em",
                    boxShadow: "0 2px 12px rgba(91,95,151,0.35)",
                  }}
                >
                  {forgotStatus === "sending" ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setCardView("auth");
                  setForgotStatus("idle");
                  setForgotError(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>

          /* ── Forgot password sent confirmation ────────────────────────── */
          ) : cardView === "forgot_password_sent" ? (
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
                  style={{ background: "var(--color-brand-50)" }}
                >
                  <Mail className="h-7 w-7" style={{ color: "var(--color-brand-500)" }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-brand-700)" }}>
                  Reset link sent
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  If an account exists for
                </p>
                <p className="text-sm font-semibold mt-1 break-all" style={{ color: "var(--color-brand-600)" }}>
                  {forgotEmail}
                </p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  you&apos;ll receive a password reset link shortly.{" "}
                  <strong className="font-semibold text-slate-600">
                    Check your spam folder if you don&apos;t see it.
                  </strong>
                </p>
              </div>

              {resetResendStatus === "sent" && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl border text-sm text-center"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0", color: "#166534" }}
                >
                  Reset link resent successfully.
                </div>
              )}
              {resetResendStatus === "error" && resetResendError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-center text-red-700">
                  {resetResendError}
                </div>
              )}

              <button
                type="button"
                disabled={resetResendStatus === "sending" || resetResendStatus === "sent"}
                onClick={async () => {
                  setResetResendStatus("sending");
                  setResetResendError(null);
                  const result = await handleResendPasswordReset(forgotEmail);
                  if ("error" in result) {
                    setResetResendStatus("error");
                    setResetResendError(result.error ?? null);
                  } else {
                    setResetResendStatus("sent");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4"
                style={{
                  background: "var(--color-brand-50)",
                  color: "var(--color-brand-600)",
                  border: "1.5px solid var(--color-brand-100)",
                }}
              >
                <RefreshCw
                  className={clsx("h-4 w-4", resetResendStatus === "sending" && "animate-spin")}
                />
                {resetResendStatus === "sending"
                  ? "Sending…"
                  : resetResendStatus === "sent"
                  ? "Email Sent"
                  : "Resend Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCardView("auth");
                  setTab("signin");
                  setForgotStatus("idle");
                  setForgotError(null);
                  setResetResendStatus("idle");
                  setResetResendError(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>

          /* ── Sign In / Sign Up tabs ───────────────────────────────────── */
          ) : (
            <>
              <div className="flex" style={{ borderBottom: "1px solid #EEEEF7" }}>
                {(["signin", "signup"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                      setDeviceLocked(false);
                      setDuplicateEmail(null);
                      setConfirmPassword("");
                      setPassword("");
                      setTermsAccepted(false);
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

              <div className="p-8">
                <Suspense>
                  <DuplicateSessionAlert />
                  <LoginRequiredAlert />
                  <LinkExpiredAlert />
                </Suspense>

                {/* Device locked callout */}
                {deviceLocked && (
                  <DeviceLockedAlert onDismiss={() => setDeviceLocked(false)} />
                )}

                {/* Duplicate-email callout */}
                {duplicateEmail && (
                  <AlreadyRegisteredCallout
                    email={duplicateEmail}
                    onSignInClick={() => switchToSignIn(duplicateEmail)}
                  />
                )}

                {/* Generic error */}
                {error && !duplicateEmail && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form
                  className="space-y-5"
                  action={async (formData) => {
                    setError(null);
                    setDeviceLocked(false);
                    setDuplicateEmail(null);
                    if (tab === "signup" && passwordMismatch) {
                      setError("Passwords do not match.");
                      return;
                    }
                    if (tab === "signin") {
                      const result = await handleSignIn(formData);
                      if (result?.error === "device_locked") {
                        setDeviceLocked(true);
                      } else if (result?.error) {
                        setError(result.error);
                      }
                    } else {
                      const result = await handleSignUp(formData);
                      if (result && "error" in result) {
                        if (result.error === "email_already_registered") {
                          setDuplicateEmail((result as { error: "email_already_registered"; email: string }).email);
                        } else {
                          setError(result.error as string);
                        }
                      } else if (result?.success === "verify_email") {
                        setSignUpState({ stage: "verify_email", email: result.email });
                      }
                    }
                  }}
                >
                  <Suspense>
                    <NextField />
                  </Suspense>

                  {tab === "signup" && <NameFields />}

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
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                        style={{ color: "var(--color-brand-700)" }}
                      >
                        Password
                      </label>
                      {tab === "signin" && (
                        <button
                          type="button"
                          onClick={() => setCardView("forgot_password")}
                          className="text-xs font-medium hover:underline underline-offset-2 transition-colors"
                          style={{ color: "var(--color-brand-500)" }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={tab === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={8}
                      value={tab === "signup" ? password : undefined}
                      onChange={tab === "signup" ? (e) => setPassword(e.target.value) : undefined}
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
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--color-brand-700)" }}
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white placeholder:text-slate-400 transition focus:outline-none"
                        style={{
                          border: passwordMismatch
                            ? "1.5px solid #f87171"
                            : "1.5px solid var(--color-brand-100)",
                          color: "var(--color-brand-700)",
                        }}
                        onFocus={(e) => {
                          if (!passwordMismatch) {
                            e.currentTarget.style.borderColor = "var(--color-brand-500)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,95,151,0.12)";
                          }
                        }}
                        onBlur={(e) => {
                          if (!passwordMismatch) {
                            e.currentTarget.style.borderColor = "var(--color-brand-100)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                        placeholder="Re-enter your password"
                      />
                      {passwordMismatch && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                      )}
                    </div>
                  )}

                  {tab === "signup" && (
                    <div className="flex items-start gap-3">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded cursor-pointer accent-[var(--color-brand-500)]"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                        I have read and agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline-offset-2 hover:underline"
                          style={{ color: "var(--color-brand-500)" }}
                        >
                          Terms and Conditions
                        </Link>
                        . Access to the program directory requires a paid subscription.
                      </label>
                    </div>
                  )}

                  <SubmitButton
                    label={tab === "signin" ? "Sign In" : "Create Account"}
                    pendingLabel="Working…"
                    disabled={tab === "signup" && (passwordMismatch || !termsAccepted)}
                  />
                </form>
                <p className="mt-5 text-center text-sm text-slate-400">
                  {tab === "signin" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setTab("signup");
                          setError(null);
                          setDuplicateEmail(null);
                          setConfirmPassword("");
                          setPassword("");
                          setTermsAccepted(false);
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
                          setDuplicateEmail(null);
                          setConfirmPassword("");
                          setPassword("");
                          setTermsAccepted(false);
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
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Summer Select &copy; {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
