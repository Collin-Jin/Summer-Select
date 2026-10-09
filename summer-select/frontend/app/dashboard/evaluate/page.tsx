import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { EVALUATOR_IN_DEVELOPMENT } from "@/lib/features";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { EvaluateClientView } from "./EvaluateClientView";

export const metadata: Metadata = {
  title: "Essay Evaluator",
};

export default async function EvaluatePage() {
  const viewer = await getViewer();

  // Guests and free accounts see the members-only preview. /api/evaluate also checks payment.
  if (!viewer.isPaid) {
    return <LockedFeature feature="evaluate" access={viewer.access} nextPath="/dashboard/evaluate" />;
  }

  // Paid members get an "in development" notice until the evaluator is released.
  if (EVALUATOR_IN_DEVELOPMENT) {
    return (
      <LockedFeature
        feature="evaluate"
        access={viewer.access}
        nextPath="/dashboard/evaluate"
        inDevelopment
      />
    );
  }

  return <EvaluateClientView />;
}
