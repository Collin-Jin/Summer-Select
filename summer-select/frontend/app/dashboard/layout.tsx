import { SiteShell } from "@/components/layout/SiteShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Layout for /dashboard/*.
 *
 * This layout does NOT require a session: the Program Directory
 * (/dashboard and /dashboard/program/[slug]) is public. Each page decides what
 * to show for the visitor's tier:
 *  - My List needs a free account (guests are redirected to log in).
 *  - Essays, Evaluate and Interviews need payment; everyone else sees a blurred
 *    preview with a sign-up or upgrade prompt (see `LockedFeature`).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
