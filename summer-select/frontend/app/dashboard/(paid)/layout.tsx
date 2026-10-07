import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { loginUrl } from "@/lib/access";

/**
 * Gate for the members-only pages: My List, Essays, Evaluate and Interviews.
 *
 * - Guests are sent to the login page with a "please log in" notice.
 *   (middleware.ts normally catches them first and also remembers the page
 *   they wanted; this is the server-side backstop.)
 * - Signed-in users who haven't paid are sent to the landing page, which
 *   explains what Summer Select offers.
 *
 * The data itself is additionally protected by Supabase RLS policies.
 */
export default async function PaidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPaid } = await getViewer();

  if (!user) redirect(loginUrl());
  if (!isPaid) redirect("/");

  return <>{children}</>;
}
