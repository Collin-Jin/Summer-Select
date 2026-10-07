import { SiteShell } from "@/components/layout/SiteShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Layout for /dashboard/*.
 *
 * The Program Directory (/dashboard and /dashboard/program/[slug]) is public,
 * so this layout does NOT require a session. The members-only pages live in the
 * `(paid)` route group, whose own layout enforces sign-in and payment.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
