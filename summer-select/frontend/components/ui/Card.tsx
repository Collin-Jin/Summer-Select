import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  /** When true, adds a hover shadow transition for interactive cards. */
  hoverable?: boolean;
  /** When true, renders a subtle border ring instead of a shadow. */
  outlined?: boolean;
}

/**
 * Base card container used for program listings, detail sections, and modals.
 *
 * @example
 * <Card hoverable>
 *   <p>Program content</p>
 * </Card>
 */
export function Card({ className, children, hoverable, outlined }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl",
          outlined
            ? "border border-slate-200"
            : "shadow-sm border border-slate-100",
          hoverable &&
            "transition-all duration-200 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 cursor-pointer",
          className
        )
      )}
    >
      {children}
    </div>
  );
}

/** A horizontal separator for use within a Card's content sections. */
export function CardDivider({ className }: { className?: string }) {
  return <hr className={twMerge("border-slate-100", className)} />;
}
