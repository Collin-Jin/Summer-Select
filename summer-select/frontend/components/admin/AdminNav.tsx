"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  Users,
} from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/prompts", label: "Essay prompts", icon: FileText },
  { href: "/admin/essays", label: "Example essays", icon: BookOpen },
  { href: "/admin/guides", label: "Interview guides", icon: MessageSquare },
  { href: "/admin/documents", label: "AI reference essays", icon: Brain },
  { href: "/admin/users", label: "Members", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
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
          </Link>
        );
      })}
    </nav>
  );
}
