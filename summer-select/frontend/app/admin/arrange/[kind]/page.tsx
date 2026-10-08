import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { loadArrangeGroups } from "@/lib/admin/arrange";
import { ARRANGE_CONFIGS, isArrangeKind } from "@/lib/admin/arrangeTypes";
import { Arranger } from "@/components/admin/Arranger";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function ArrangePage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isArrangeKind(kind)) notFound();

  const { supabase } = await requireAdmin();
  const config = ARRANGE_CONFIGS[kind];
  const groups = await loadArrangeGroups(supabase, kind);

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: config.title }]}
      />
      <Arranger config={config} initialGroups={groups} />
    </>
  );
}
