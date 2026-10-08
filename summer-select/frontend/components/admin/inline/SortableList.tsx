"use client";

import { Fragment } from "react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { clsx } from "clsx";
import { useAdmin } from "./AdminProvider";

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

interface SortableListProps<T extends { id: string }> {
  items: T[];
  /** Called with the full new order after a drop. */
  onReorder: (next: T[]) => void;
  /** "grid" for card grids, "list" for stacked rows. */
  layout?: "grid" | "list";
  className?: string;
  /**
   * Renders one item. `handle` is the drag grip (null when not in Edit mode);
   * place it wherever it fits the design.
   */
  renderItem: (item: T, index: number, handle: React.ReactNode) => React.ReactNode;
}

/**
 * A list that becomes drag-and-drop for the admin in Edit mode, and is a plain
 * list for everyone else.
 */
export function SortableList<T extends { id: string }>(props: SortableListProps<T>) {
  const { editing } = useAdmin();
  if (!editing || props.items.length < 2) {
    return (
      <div className={props.className}>
        {props.items.map((item, i) => (
          <Fragment key={item.id}>{props.renderItem(item, i, null)}</Fragment>
        ))}
      </div>
    );
  }
  return <ActiveSortableList {...props} />;
}

function ActiveSortableList<T extends { id: string }>({
  items,
  onReorder,
  layout = "list",
  className,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={layout === "list" ? [verticalOnly] : undefined}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item, i) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, i, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label="Drag to reorder"
      title="Drag to reorder (or focus and press Space, then use the arrow keys)"
      onClick={(e) => e.stopPropagation()}
      className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-full bg-white/95 text-slate-600 shadow ring-1 ring-black/10 transition hover:bg-white hover:text-slate-900 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx("min-w-0", isDragging && "relative z-30 opacity-90 drop-shadow-2xl")}
    >
      {children(handle)}
    </div>
  );
}
