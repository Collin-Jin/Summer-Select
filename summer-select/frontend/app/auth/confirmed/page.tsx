import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";
import { AuthCardShell } from "@/components/auth/AuthCardShell";

export const metadata = {
  title: "Email Confirmed",
};

/**
 * Shown after a new user clicks the verification link in their signup email.
 * The auth callback exchanges the code and redirects here.
 */
export default function EmailConfirmedPage() {
  return (
    <AuthCardShell showBrandHeader={false}>
      <div className="p-8 text-center">
        <div
          className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
          style={{ background: "var(--color-brand-50)" }}
        >
          <CheckCircle2 className="h-7 w-7" style={{ color: "var(--color-brand-500)" }} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-brand-700)" }}>
          Email confirmed!
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Your account is verified. Sign in to continue to Summer Select.
        </p>
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-95"
          style={{
            background: "var(--color-brand-500)",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 12px rgba(91,95,151,0.35)",
          }}
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    </AuthCardShell>
  );
}
