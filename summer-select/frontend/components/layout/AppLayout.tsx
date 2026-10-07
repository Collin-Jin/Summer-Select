import { Navbar } from "./Navbar";
import type { ViewerAccess } from "@/lib/access";

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
  /** Who is viewing: drives which nav tabs and account controls are shown. */
  access?: ViewerAccess;
  /** Skip the centred max-width container (for full-width landing sections). */
  fullBleed?: boolean;
}

/**
 * Root layout wrapper for every page that shows the main navigation.
 * Renders the persistent top Navbar above the page content area.
 *
 * Usage: Rendered by <SiteShell>, which resolves the viewer and wraps the tree
 *        in <LanguageProvider>.
 */
export function AppLayout({
  children,
  userEmail,
  access = "guest",
  fullBleed = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <Navbar userEmail={userEmail} access={access} />
      {/* Subtle brand-gradient page topper for depth */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{
          background: "linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-brand-accent) 50%, var(--color-brand-coral) 100%)",
        }}
      />
      {fullBleed ? (
        <main className="flex-1 w-full">{children}</main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      )}
    </div>
  );
}
