"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="min-w-0">
          <h2 className="font-bold text-red-800">Something went wrong</h2>
          <p className="mt-1 break-words text-sm text-red-700">
            {error.message || "The admin page could not be loaded."}
          </p>
          <Button className="mt-4" variant="secondary" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
