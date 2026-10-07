import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { LandingView } from "@/components/landing/LandingView";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Find Your Summer Program",
};

/**
 * Landing page — the first page visitors see.
 *
 * Shown to guests and to signed-in users who haven't paid yet. Paid members
 * have no use for the pitch, so they go straight to the Program Directory.
 */
export default async function Home() {
  const { user, isPaid } = await getViewer();

  if (isPaid) redirect("/dashboard");

  return (
    <SiteShell fullBleed>
      <LandingView isSignedIn={!!user} />
    </SiteShell>
  );
}
