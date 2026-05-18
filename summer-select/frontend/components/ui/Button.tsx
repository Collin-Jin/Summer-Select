import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Spinner } from "./Spinner";

/** All valid visual variants for the Button component. */
type Variant = "primary" | "secondary" | "ghost" | "danger";
/** All valid size scales for the Button component. */
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** When true, replaces the button content with a loading spinner. */
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "[background:var(--color-brand-500)] text-white hover:[background:var(--color-brand-600)] focus-visible:ring-[#5B5F97] border border-transparent",
  secondary:
    "bg-white [color:var(--color-brand-600)] hover:[background:var(--color-brand-50)] focus-visible:ring-[#5B5F97] border [border-color:var(--color-brand-100)]",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400 border border-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

/**
 * General-purpose Button component with variant, size, and loading state support.
 *
 * @example
 * <Button variant="primary" size="md" loading={isSubmitting}>Save</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
