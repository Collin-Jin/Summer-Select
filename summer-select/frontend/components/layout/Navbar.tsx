"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Bookmark,
  BookOpen,
  MessageSquare,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", labelZh: "主页", icon: LayoutDashboard },
  { href: "/dashboard/my-list", label: "My List", labelZh: "收藏", icon: Bookmark },
  { href: "/dashboard/essays", label: "Essays", labelZh: "文书", icon: BookOpen },
  { href: "/dashboard/interviews", label: "Interviews", labelZh: "面试", icon: MessageSquare },
];

/**
 * Top navigation bar for all authenticated (paid) routes.
 * Features:
 * - Brand logo + app name
 * - Navigation links with active state
 * - EN / 中文 language toggle
 * - User email display with sign-out action
 * - Mobile-responsive hamburger menu
 */
export function Navbar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-indigo-700 hover:text-indigo-800 transition-colors"
          >
            <GraduationCap className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight">
              Summer Select
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, labelZh, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {lang === "zh" ? labelZh : label}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              title="Switch language"
            >
              {lang === "en" ? "中文" : "EN"}
            </button>

            {/* User + sign out */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              {userEmail && (
                <span className="text-xs text-slate-500 max-w-[140px] truncate">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map(({ href, label, labelZh, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {lang === "zh" ? labelZh : label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setLang(lang === "en" ? "zh" : "en")}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                {lang === "en" ? "中文" : "EN"}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
