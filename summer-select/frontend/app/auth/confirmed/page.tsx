import Link from "next/link";
import { ArrowRight, CheckCircle2, LogIn } from "lucide-react";
import { AuthCardShell } from "@/components/auth/AuthCardShell";
import { getViewer } from "@/lib/viewer";

export const metadata = {
  title: "Email Confirmed",
};

/**
 * Shown after a new user clicks the verification link in their signup email.
 * The auth callback exchanges the code and redirects here. If the link was
 * opened in the same browser they signed up in they are already signed in and
 * can carry on; otherwise they are asked to sign in.
 */
export default async function EmailConfirmedPage() {
  const { user } = await getViewer();

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
          {user
            ? "Your account is verified and you're signed in."
            : "Your account is verified. Sign in to continue to Summer Select."}
        </p>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-95"
          style={{
            background: "var(--color-brand-500)",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 12px rgba(91,95,151,0.35)",
          }}
        >
          {user ? <ArrowRight className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {user ? "Continue to Summer Select" : "Sign In"}
        </Link>
      </div>
    </AuthCardShell>
  );
}
