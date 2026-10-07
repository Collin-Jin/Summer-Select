import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getCascadeCounts,
  getChildRows,
  getRawRecord,
  getRefOptions,
  getSuggestions,
  parentHref,
} from "@/lib/admin/data";
import { getResource, initialFormValues, toFormSpec } from "@/lib/admin/resources";
import { ChildrenPanel } from "@/components/admin/ChildrenPanel";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const { supabase } = await requireAdmin();
  const raw = await getRawRecord(supabase, resource, id);
  if (!raw) notFound();

  const formRow = resource.fromRow ? resource.fromRow(raw) : raw;
  const title = resource.title(formRow);

  const [refOptions, suggestions, cascade, children, backHref] = await Promise.all([
    getRefOptions(supabase, resource),
    getSuggestions(supabase, resource),
    getCascadeCounts(supabase, resource, raw),
    Promise.all((resource.children ?? []).map((c) => getChildRows(supabase, resource, raw, c))),
    resource.parent ? parentHref(supabase, resource, raw) : Promise.resolve(`/admin/${resource.key}`),
  ]);

  const shortTitle = title.length > 48 ? `${title.slice(0, 47)}…` : title;
  const parentResource = resource.parent ? getResource(resource.parent.resource) : null;
  const crumbs = parentResource
    ? [
        { label: "Admin", href: "/admin" },
        { label: `Back to ${parentResource.singular}`, href: backHref },
        { label: shortTitle },
      ]
    : [
        { label: "Admin", href: "/admin" },
        { label: resource.label, href: `/admin/${resource.key}` },
        { label: shortTitle },
      ];

  const publicHref =
    resource.key === "programs" && raw.is_published === true && typeof raw.slug === "string" ? `/dashboard/program/${raw.slug}` : null;

  return (
    <>
      <PageHeader
        title={title}
        description={`Edit ${resource.singular}. Changes go live on the website as soon as you save.`}
        crumbs={crumbs}
        actions={
          publicHref ? (
            <Link
              href={publicHref}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View on site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-6">
        <ResourceForm
          spec={toFormSpec(resource)}
          id={id}
          initialValues={initialFormValues(resource.fields, formRow)}
          refOptions={refOptions}
          suggestions={suggestions}
          cancelHref={backHref}
          extraActions={<DeleteButton resourceKey={resource.key} id={id} name={`“${title}”`} cascade={cascade} />}
        />

        {children.map((c) => (
          <ChildrenPanel key={c.child.resource} parent={resource} parentRow={raw} data={c} />
        ))}
      </div>
    </>
  );
}
