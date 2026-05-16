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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userEmail={userEmail} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
