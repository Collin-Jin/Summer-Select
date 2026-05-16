"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { addFavorite, removeFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  programId: string;
  initialFavorited: boolean;
  /** 'sm' for cards, 'md' for the detail page header */
  size?: "sm" | "md";
  onToggle?: (nowFavorited: boolean) => void;
}

/**
 * Toggle button that adds or removes a program from the user's favorites list.
 * Uses optimistic UI — the state updates immediately while the network request runs.
 *
 * The parent should pass `initialFavorited` as the server-resolved value on first render
 * and optionally listen via `onToggle` to sync local list state.
 */
export function FavoriteButton({
  programId,
  initialFavorited,
  size = "sm",
  onToggle,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    // Prevent click from bubbling to a parent Link
    e.preventDefault();
    e.stopPropagation();

    const next = !favorited;
    // Optimistic update
    setFavorited(next);
    onToggle?.(next);

    startTransition(async () => {
      const ok = next
        ? await addFavorite(programId)
        : await removeFavorite(programId);

      // Roll back on failure
      if (!ok) {
        setFavorited(!next);
        onToggle?.(!next);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={favorited ? "Remove from My List" : "Save to My List"}
      aria-label={favorited ? "Remove from My List" : "Save to My List"}
      className={clsx(
        "rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "p-1.5",
        size === "md" && "p-2.5"
      )}
    >
      <Heart
        className={clsx(
          "transition-all duration-150",
          size === "sm" && "h-4 w-4",
          size === "md" && "h-5 w-5",
          favorited
            ? "fill-rose-500 text-rose-500"
            : "fill-transparent text-slate-400 hover:text-rose-400"
        )}
      />
    </button>
  );
}
