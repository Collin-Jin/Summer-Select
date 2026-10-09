"use client";

import { useState, useEffect } from "react";
import { FavoriteButton } from "@/components/programs/FavoriteButton";
import { fetchFavorites } from "@/lib/favorites";
import type { ViewerAccess } from "@/lib/access";

interface ProgramDetailFavoriteButtonProps {
  programId: string;
  access: ViewerAccess;
}

/**
 * Wrapper that loads the initial favorited state client-side
 * and renders the FavoriteButton at the "md" size for the detail page header.
 */
export function ProgramDetailFavoriteButton({ programId, access }: ProgramDetailFavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loaded, setLoaded] = useState(access === "guest");

  useEffect(() => {
    if (access === "guest") return;
    fetchFavorites().then((favs) => {
      setIsFavorited(favs.some((f) => f.program_id === programId));
      setLoaded(true);
    });
  }, [programId, access]);

  if (!loaded) return null;

  return (
    <FavoriteButton
      programId={programId}
      initialFavorited={isFavorited}
      size="md"
      access={access}
      onToggle={setIsFavorited}
    />
  );
}
