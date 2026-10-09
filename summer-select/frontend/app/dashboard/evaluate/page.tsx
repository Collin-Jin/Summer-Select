import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { LockedFeature } from "@/components/paywall/LockedFeature";
import { EvaluateClientView } from "./EvaluateClientView";

export const metadata: Metadata = {
  title: "Essay Evaluator",
};

export default async function EvaluatePage() {
  // Free accounts and guests see a blurred preview. /api/evaluate also checks payment.
  const viewer = await getViewer();
  if (!viewer.isPaid) {
    return <LockedFeature feature="evaluate" access={viewer.access} nextPath="/dashboard/evaluate" />;
  }

  return <EvaluateClientView />;
}
