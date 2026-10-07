import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getRefOptions, getSuggestions, parentHref } from "@/lib/admin/data";
import { getResource, initialFormValues, toFormSpec } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function NewRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  // Values passed in the URL (e.g. ?program_slug=…) pre-fill the form.
  const presets: Record<string, string> = {};
  for (const f of resource.fields) {
    const v = sp[f.name];
    const value = Array.isArray(v) ? v[0] : v;
    if (typeof value === "string" && value.length <= 200) presets[f.name] = value;
  }

  const [refOptions, suggestions] = await Promise.all([
    getRefOptions(supabase, resource),
    getSuggestions(supabase, resource),
  ]);

  const parentLinkValue = resource.parent ? presets[resource.parent.field] : undefined;
  const cancelHref = parentLinkValue
    ? await parentHref(supabase, resource, { [resource.parent!.field]: parentLinkValue })
    : `/admin/${resource.key}`;

  return (
    <>
      <PageHeader
        title={`New ${resource.singular}`}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: resource.label, href: `/admin/${resource.key}` },
          { label: "New" },
        ]}
      />
      <ResourceForm
        spec={toFormSpec(resource)}
        id={null}
        initialValues={initialFormValues(resource.fields, null, presets)}
        refOptions={refOptions}
        suggestions={suggestions}
        cancelHref={cancelHref}
      />
    </>
  );
}
