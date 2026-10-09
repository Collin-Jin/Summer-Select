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

  // Not released yet: everyone sees the blurred preview with an "in development" notice.
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

  // Free accounts and guests see a blurred preview. /api/evaluate also checks payment.
  if (!viewer.isPaid) {
    return <LockedFeature feature="evaluate" access={viewer.access} nextPath="/dashboard/evaluate" />;
  }

  return <EvaluateClientView />;
}
