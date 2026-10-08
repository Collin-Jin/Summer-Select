"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Check, ChevronDown, GripVertical, Pencil } from "lucide-react";
import { clsx } from "clsx";
import { saveArrangement } from "@/app/admin/actions";
import type { ArrangeConfig, ArrangeGroup, ArrangeItem } from "@/lib/admin/arrangeTypes";
import { Button } from "@/components/ui/Button";

/** Keep dragging on the vertical axis: these are simple top-to-bottom lists. */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

const signature = (groups: ArrangeGroup[]) =>
  JSON.stringify(groups.map((g) => [g.id, g.items.map((i) => i.id)]));

export function Arranger({
  config,
  initialGroups,
}: {
  config: ArrangeConfig;
  initialGroups: ArrangeGroup[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<ArrangeGroup[]>(initialGroups);
  const [baseline, setBaseline] = useState(() => signature(initialGroups));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => signature(groups) !== baseline, [groups, baseline]);

  const sensors = useSensors(
    // A small distance lets clicks on buttons/links work without starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!dirty || pending) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, pending]);

  useEffect(() => {
    if (!message?.ok) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  function onGroupDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setGroups((prev) => {
      const from = prev.findIndex((g) => g.id === active.id);
      const to = prev.findIndex((g) => g.id === over.id);
      return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
    });
    setMessage(null);
  }

  function onItemsReordered(groupId: string, items: ArrangeItem[]) {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, items } : g)));
    setMessage(null);
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allExpanded = groups.length > 0 && groups.every((g) => expanded.has(g.id));

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await saveArrangement(
          config.kind,
          groups.map((g) => ({ id: g.id, itemIds: g.items.map((i) => i.id) }))
        );
        if (!res.ok) {
          setMessage({ ok: false, text: res.error ?? "Could not save the order." });
          return;
        }
        setBaseline(signature(groups));
        setMessage({ ok: true, text: res.message });
        router.refresh();
      } catch {
        setMessage({ ok: false, text: "Couldn't reach the server. Try again." });
      }
    });
  }

  function reset() {
    setGroups(initialGroups);
    setMessage(null);
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Nothing to arrange yet. Add some {config.groupNoun} content first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {groups.length} {groups.length === 1 ? config.groupNoun : config.groupNounPlural} · grab the{" "}
          <GripVertical className="inline h-4 w-4 align-text-bottom text-slate-400" /> handle to move
        </p>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(groups.map((g) => g.id)))}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-brand-600)] transition hover:bg-[var(--color-brand-50)]"
        >
          {allExpanded ? "Collapse all" : `Expand all to arrange ${config.itemNounPlural}`}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[verticalOnly]}
        onDragEnd={onGroupDragEnd}
      >
        <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-3">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                position={index + 1}
                open={expanded.has(group.id)}
                onToggle={() => toggle(group.id)}
                config={config}
                sensors={sensors}
                onItemsReordered={(items) => onItemsReordered(group.id, items)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {/* Sticky save bar */}
      <div className="sticky bottom-3 z-30 rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 text-sm" aria-live="polite">
            {message ? (
              <span
                className={clsx(
                  "inline-flex items-start gap-1.5 font-medium",
                  message.ok ? "text-emerald-600" : "text-red-600"
                )}
              >
                {message.ok ? <Check className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                {message.text}
              </span>
            ) : dirty ? (
              <span className="text-amber-600">New order not saved yet.</span>
            ) : (
              <span className="text-slate-400">Order is up to date.</span>
            )}
          </div>
          {dirty && (
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Undo changes
            </button>
          )}
          <Button onClick={save} loading={pending} disabled={!dirty}>
            Save order
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Handle({
  label,
  listeners,
  attributes,
  setActivatorNodeRef,
}: {
  label: string;
  listeners?: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
  setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
}) {
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={label}
      title="Drag to reorder (or focus and press Space, then use the arrow keys)"
      className="flex h-9 w-7 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );
}

function GroupCard({
  group,
  position,
  open,
  onToggle,
  config,
  sensors,
  onItemsReordered,
}: {
  group: ArrangeGroup;
  position: number;
  open: boolean;
  onToggle: () => void;
  config: ArrangeConfig;
  sensors: ReturnType<typeof useSensors>;
  onItemsReordered: (items: ArrangeItem[]) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id });

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = group.items.findIndex((i) => i.id === active.id);
    const to = group.items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onItemsReordered(arrayMove(group.items, from, to));
  }

  const count = group.items.length;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx(
        "rounded-xl border bg-white shadow-sm",
        isDragging ? "relative z-20 border-[var(--color-brand-500)] shadow-xl ring-2 ring-[var(--color-brand-500)]/20" : "border-slate-200"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Handle
          label={`Reorder ${group.title}`}
          attributes={attributes}
          listeners={listeners}
          setActivatorNodeRef={setActivatorNodeRef}
        />
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-sm font-bold tabular-nums text-white">
          {position}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-slate-900">{group.title}</span>
            <span className="block truncate text-xs text-slate-500">
              {count} {count === 1 ? config.itemNoun : config.itemNounPlural}
              {group.subtitle ? ` · ${group.subtitle}` : ""}
            </span>
          </span>
          <ChevronDown className={clsx("h-4 w-4 flex-shrink-0 text-slate-400 transition", open && "rotate-180")} />
        </button>
        <Link
          href={group.href}
          className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Edit ${group.title}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3 sm:pl-14">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[verticalOnly]}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ol className="space-y-2">
                {group.items.map((item, index) => (
                  <ItemRow key={item.id} item={item} position={index + 1} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </li>
  );
}

function ItemRow({ item, position }: { item: ArrangeItem; position: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx(
        "flex items-start gap-2 rounded-lg border bg-white px-2 py-2",
        isDragging ? "relative z-20 border-[var(--color-brand-500)] shadow-lg" : "border-slate-200"
      )}
    >
      <Handle
        label={`Reorder: ${item.title}`}
        attributes={attributes}
        listeners={listeners}
        setActivatorNodeRef={setActivatorNodeRef}
      />
      <span className="mt-1.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-xs font-bold tabular-nums text-[var(--color-brand-700)]">
        {position}
      </span>
      <div className="min-w-0 flex-1 py-1">
        <p className="line-clamp-2 text-sm text-slate-800">{item.title}</p>
        {item.badges.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {item.badges.map((b) => (
              <span
                key={b.text}
                className={clsx(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  b.tone === "warn" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                )}
              >
                {b.text}
              </span>
            ))}
          </div>
        )}
      </div>
      <Link
        href={item.href}
        className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Edit"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    </li>
  );
}
