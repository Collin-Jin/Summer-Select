"use client";

import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import { GraduationCap, CheckCircle2, XCircle, LogOut, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

const freeFeatures = [
  "Create an account",
  "View basic program names",
];

const paidFeatures = [
  "Full program directory (50+ programs)",
  "Collin Index scores & rationale",
  "Application strategy guides",
  "Bilingual content (EN / 中文)",
  "Advanced search & filters",
  "Save programs to My List",
  "Example essays (5 programs)",
  "Interview Q&A guides",
];

/**
 * Upsell page shown to authenticated users whose `is_paid` flag is false.
 * Displays a feature comparison and contact details to upgrade.
 */
export default function PaywallPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 shadow-md mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Summer Select
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Unlock the full directory and strategic analysis platform
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-6">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-6 py-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Feature
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Free
            </div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider text-center">
              Paid ✦
            </div>
          </div>

          {/* Free rows */}
          {freeFeatures.map((f) => (
            <div
              key={f}
              className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0"
            >
              <div className="text-sm text-slate-700">{f}</div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          ))}

          {/* Paid rows */}
          {paidFeatures.map((f) => (
            <div
              key={f}
              className="grid grid-cols-3 px-6 py-3 border-b border-slate-50 last:border-0 bg-indigo-50/30"
            >
              <div className="text-sm text-slate-700">{f}</div>
              <div className="flex justify-center">
                <XCircle className="h-4 w-4 text-slate-300" />
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white text-center mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">
            Ready to get full access?
          </h2>
          <p className="text-indigo-200 text-sm mb-6">
            Contact us via WeChat or Instagram to subscribe and get your account
            upgraded instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-xl px-5 py-3">
              <MessageCircle className="h-5 w-5 text-indigo-200" />
              <div className="text-left">
                <p className="text-xs text-indigo-300">WeChat</p>
                <p className="font-semibold text-sm">@summerselect</p>
              </div>
            </div>
            <a
              href="https://instagram.com/summerselectofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 rounded-xl px-5 py-3 hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-indigo-200" />
              <div className="text-left">
                <p className="text-xs text-indigo-300">Instagram</p>
                <p className="font-semibold text-sm">@summerselectofficial</p>
              </div>
            </a>
          </div>
        </div>

        {/* Sign out */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out of this account
          </Button>
        </div>
      </div>
    </div>
  );
}
