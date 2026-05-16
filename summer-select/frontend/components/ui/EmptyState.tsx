import React from "react";

interface EmptyStateProps {
  /** Icon to display — accepts any React node (e.g. a Lucide icon). */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional call-to-action button rendered below the description. */
  action?: React.ReactNode;
}

/**
 * Full-area empty state component displayed when a list has no results.
 * Used for no-search-results, no favorites, and no programs states.
 *
 * @example
 * <EmptyState
 *   icon={<BookmarkIcon className="h-10 w-10" />}
 *   title="No saved programs"
 *   description="Heart a program on the dashboard to add it here."
 * />
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="mb-4 text-slate-300">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
