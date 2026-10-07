/** Shared Tailwind class strings so every admin control looks the same. */

export const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition focus:border-[var(--color-brand-500)] " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/25 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export const inputErrorClass =
  "!border-red-400 focus:!border-red-500 focus:!ring-red-500/20";

export const labelClass = "block text-sm font-semibold text-slate-800";
export const helpClass = "mt-1 text-xs text-slate-500";
export const errorClass = "mt-1 text-xs font-medium text-red-600";
