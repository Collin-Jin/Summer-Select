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
} from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Programs", labelZh: "项目库", icon: LayoutDashboard },
  { href: "/dashboard/my-list", label: "My List", labelZh: "收藏", icon: Bookmark },
  { href: "/dashboard/essays", label: "Essays", labelZh: "文书", icon: BookOpen },
  { href: "/dashboard/interviews", label: "Interviews", labelZh: "面试", icon: MessageSquare },
];

export function Navbar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav
      className="sticky top-0 z-40"
      style={{ background: "var(--color-brand-500)", borderBottom: "1px solid var(--color-brand-600)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand wordmark */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <div className="flex flex-col leading-none">
              <span
                className="text-lg font-extrabold tracking-tight uppercase"
                style={{
                  fontFamily: "var(--font-syne, sans-serif)",
                  color: "#FFFFFB",
                  letterSpacing: "0.04em",
                }}
              >
                Summer Select
              </span>
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--color-brand-accent)", letterSpacing: "0.22em" }}
              >
                by Collin
              </span>
            </div>
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
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                      style={{ background: "var(--color-brand-accent)" }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  {lang === "zh" ? labelZh : label}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <LanguageToggle />

            {/* User + sign out */}
            <div
              className="flex items-center gap-2 pl-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.2)" }}
            >
              {userEmail && (
                <span
                  className="text-xs max-w-[140px] truncate"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg transition-all"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-brand-coral)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,108,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#FFFFFB", background: "rgba(255,255,255,0.1)" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            background: "var(--color-brand-600)",
          }}
        >
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
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  style={isActive ? { borderLeft: "3px solid var(--color-brand-accent)" } : { borderLeft: "3px solid transparent" }}
                >
                  <Icon className="h-4 w-4" />
                  {lang === "zh" ? labelZh : label}
                </Link>
              );
            })}
            <div
              className="pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
            >
              <LanguageToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg"
                style={{ color: "var(--color-brand-rose)" }}
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
