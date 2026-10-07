"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPublished } from "@/app/admin/actions";
import { Toggle } from "./ResourceForm";

/** Publish / unpublish a record straight from a list, with instant feedback. */
export function PublishSwitch({
  resourceKey,
  id,
  initial,
}: {
  resourceKey: string;
  id: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [published, setPublishedState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    const previous = published;
    setPublishedState(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await setPublished(resourceKey, id, next);
        if (!res.ok) {
          setPublishedState(previous);
          setError(res.error ?? "Could not update.");
          return;
        }
        router.refresh();
      } catch {
        setPublishedState(previous);
        setError("Network error.");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start">
      <Toggle checked={published} onChange={toggle} disabled={pending} label={published ? "Live" : "Draft"} />
      {error && <span className="mt-0.5 text-xs text-red-600">{error}</span>}
    </div>
  );
}
