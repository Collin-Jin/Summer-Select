import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Semantic color variants for the Badge component.
 * Mapped to consistent Tailwind color classes throughout the app.
 */
type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "amber"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-orange-100 text-orange-700",
  outline: "bg-transparent border border-slate-300 text-slate-600",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

/**
 * Compact label pill used throughout the app for categories, statuses, and metadata.
 *
 * @example
 * <Badge variant="success">Financial Aid</Badge>
 * <Badge variant="danger" size="sm">Urgent</Badge>
 */
export function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center font-medium rounded-full whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
}

// ── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Returns the correct Badge variant for a deadline urgency tier.
 */
export function deadlineTierVariant(
  tier: "closed" | "urgent" | "soon" | "open"
): BadgeVariant {
  switch (tier) {
    case "closed":
      return "danger";
    case "urgent":
      return "danger";
    case "soon":
      return "warning";
    case "open":
      return "success";
  }
}

/**
 * Returns the correct Badge variant for a program category.
 * A consistent, deterministic mapping based on the first character.
 */
export function categoryVariant(category: string | null): BadgeVariant {
  if (!category) return "default";
  const c = category.toLowerCase();
  if (c.includes("bio") || c.includes("life")) return "success";
  if (c.includes("stem") || c.includes("sci")) return "info";
  if (c.includes("med") || c.includes("health")) return "purple";
  if (c.includes("env") || c.includes("earth")) return "success";
  if (c.includes("eng") || c.includes("tech")) return "amber";
  if (c.includes("social") || c.includes("human")) return "warning";
  if (c.includes("math") || c.includes("data")) return "info";
  return "default";
}
