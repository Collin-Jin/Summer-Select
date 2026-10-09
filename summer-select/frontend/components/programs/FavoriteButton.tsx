"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { addFavorite, removeFavorite } from "@/lib/favorites";
import { loginUrl, type ViewerAccess } from "@/lib/access";
import { useLanguage } from "@/context/LanguageContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface FavoriteButtonProps {
  programId: string;
  initialFavorited: boolean;
  /** 'sm' for cards, 'md' for the detail page header */
  size?: "sm" | "md";
  onToggle?: (nowFavorited: boolean) => void;
  /**
   * Saving to My List needs a free account. Guests are sent to log in instead
   * of toggling the heart.
   */
  access?: ViewerAccess;
  /** Shown in the removal confirmation, e.g. "Remove Stanford SIMR?" */
  programName?: string;
}

/**
 * Toggle button that adds or removes a program from the user's favorites list.
 * Uses optimistic UI — the state updates immediately while the network request runs.
 *
 * Removing a saved program also deletes its rating, notes and status, so
 * un-saving always asks for confirmation first.
 *
 * The parent should pass `initialFavorited` as the server-resolved value on first render
 * and optionally listen via `onToggle` to sync local list state.
 */
export function FavoriteButton({
  programId,
  initialFavorited,
  size = "sm",
  onToggle,
  access = "paid",
  programName,
}: FavoriteButtonProps) {
  const { lang } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const commit = (next: boolean) => {
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

  const handleToggle = (e: React.MouseEvent) => {
    // Prevent click from bubbling to a parent Link
    e.preventDefault();
    e.stopPropagation();

    if (access === "guest") {
      router.push(loginUrl(pathname));
      return;
    }

    if (favorited) {
      setConfirming(true);
      return;
    }
    commit(true);
  };

  const zh = lang === "zh";
  const label = programName?.trim();

  return (
    <>
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={
        access === "guest"
          ? "Log in to save to My List"
          : favorited
            ? "Remove from My List"
            : "Save to My List"
      }
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
    <ConfirmDialog
      open={confirming}
      title={zh ? "从我的收藏中移除？" : "Remove from My List?"}
      description={
        zh ? (
          <>
            移除{label ? `「${label}」` : "该项目"}将<strong>永久删除</strong>
            你为它保存的评分、笔记和申请状态，且无法恢复。
          </>
        ) : (
          <>
            Removing {label ? <strong>{label}</strong> : "this program"} will{" "}
            <strong>permanently delete</strong> your rating, notes and application status for it.
            This can&apos;t be undone.
          </>
        )
      }
      confirmLabel={zh ? "移除并删除笔记" : "Remove & delete notes"}
      cancelLabel={zh ? "保留" : "Keep it"}
      onCancel={() => setConfirming(false)}
      onConfirm={() => {
        setConfirming(false);
        commit(false);
      }}
    />
    </>
  );
}
