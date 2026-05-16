"use client";

import React from "react";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback. Defaults to a generic error card. */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * React class-based error boundary that catches render errors in its subtree.
 * Renders a user-facing error card with a retry button.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <PotentiallyFailingComponent />
 *   </ErrorBoundary>
 *
 * For per-page error handling in Next.js App Router, use the built-in
 * `error.tsx` convention alongside this component.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, forward to an error monitoring service here
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
          >
            Refresh page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
