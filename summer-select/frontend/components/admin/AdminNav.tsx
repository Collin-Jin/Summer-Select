"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Flag,
  FileText,
  GraduationCap,
  PlusCircle,
  LayoutGrid,
  MessageSquare,
  Users,
  ArrowDownUp,
} from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/prompts", label: "Essay prompts", icon: FileText },
  { href: "/admin/essays", label: "Example essays", icon: BookOpen },
  { href: "/admin/guides", label: "Interview guides", icon: MessageSquare },
  { href: "/admin/documents", label: "AI reference essays", icon: Brain },
  { href: "/admin/arrange/essays", label: "Arrange essays", icon: ArrowDownUp },
  { href: "/admin/arrange/interviews", label: "Arrange interviews", icon: ArrowDownUp },
  { href: "/admin/users", label: "Members", icon: Users },
  { href: "/admin/program-requests", label: "Program requests", icon: PlusCircle },
  { href: "/admin/reports", label: "Problem reports", icon: Flag },
];

export function AdminNav({
  openReports = 0,
  pendingRequests = 0,
  recentBlocked = 0,
}: {
  openReports?: number;
  /** Program requests waiting to be researched. */
  pendingRequests?: number;
  /** Blocked sign-ins in the last 7 days. */
  recentBlocked?: number;
}) {
  const pathname = usePathname();
  const badgeFor = (href: string) =>
    href === "/admin/reports"
      ? openReports
      : href === "/admin/program-requests"
        ? pendingRequests
        : href === "/admin/users"
          ? recentBlocked
          : 0;
  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map(({ href, label, icon: Icon, exact }) => {
        // Interview questions are edited from inside a guide, so keep "Interview guides" lit.
        const active = exact
          ? pathname === href
          : pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (href === "/admin/guides" && pathname.startsWith("/admin/questions"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {badgeFor(href) > 0 && (
              <span
                aria-label={`${badgeFor(href)} ${href === "/admin/users" ? "blocked sign-ins this week" : href === "/admin/program-requests" ? "pending" : "open"}`}
                className={clsx(
                  "ml-auto rounded-full px-1.5 py-0.5 text-[0.7rem] font-bold leading-none tabular-nums",
                  active ? "bg-white/25 text-white" : "bg-[var(--color-brand-coral)] text-white"
                )}
              >
                {badgeFor(href)}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
