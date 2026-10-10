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
  | "outline"
  | "format"
  | "gold"
  | "rose"
  | "coral";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  "bg-slate-100 text-slate-700",
  success:  "bg-emerald-100 text-emerald-700",
  warning:  "[background:#FFF8EC] [color:#92600A]",
  danger:   "bg-red-100 text-red-700",
  info:     "[background:var(--color-brand-50)] [color:var(--color-brand-600)]",
  purple:   "[background:#EEEEF7] [color:var(--color-brand-600)]",
  amber:    "[background:#FFF3D6] [color:#7A5000]",
  outline:  "bg-transparent border border-slate-300 text-slate-600",
  // ── Brand-palette-mapped variants ─────────────────────────────────────────
  // #B8B8D1 palette — for program format labels (In-Person, Virtual, etc.)
  format:   "[background:#E5E5F0] [color:#3a3d6e]",
  // #FFC145 palette — for financial / money labels (Aid, Stipend)
  gold:     "[background:#FFF0C2] [color:#7A4700]",
  // #FFB5B4 palette — for international / global labels
  rose:     "[background:#FFE4E3] [color:#881919]",
  // #FF6B6C palette — for rolling / active / time-sensitive labels
  coral:    "[background:#FFE0DF] [color:#B91818]",
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
      return "coral";
    case "soon":
      return "warning";
    case "open":
      return "success";
  }
}
