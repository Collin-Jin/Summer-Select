import type { Metadata } from "next";
import { EvaluateClientView } from "./EvaluateClientView";

export const metadata: Metadata = {
  title: "Essay Evaluator",
};

export default function EvaluatePage() {
  return <EvaluateClientView />;
}
