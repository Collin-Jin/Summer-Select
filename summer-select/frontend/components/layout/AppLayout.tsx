import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

/**
 * Root layout wrapper for all paid/authenticated routes.
 * Renders the persistent top Navbar above the page content area.
 *
 * Usage: Rendered inside `app/dashboard/layout.tsx` which handles
 *        auth gating and wraps the tree in <LanguageProvider>.
 */
export function AppLayout({ children, userEmail }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <Navbar userEmail={userEmail} />
      {/* Subtle brand-gradient page topper for depth */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{
          background: "linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-brand-accent) 50%, var(--color-brand-coral) 100%)",
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
