/**
 * Shimmer skeleton placeholder that matches ProgramCard's visual structure.
 * Shown in a grid while favorites are loading from Supabase.
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col">
      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header row: logo + title stack */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="skeleton h-10 w-10 flex-shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-4/5 rounded-md" />
              <div className="skeleton h-3 w-3/5 rounded-md" />
            </div>
          </div>
          {/* Score pill */}
          <div className="skeleton h-7 w-9 rounded-full flex-shrink-0" />
        </div>

        {/* Badge row */}
        <div className="flex gap-1.5 flex-wrap">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>

        {/* Meta details */}
        <div className="mt-auto pt-3 border-t border-slate-50 space-y-1.5">
          <div className="skeleton h-3 w-2/3 rounded-md" />
          <div className="skeleton h-3 w-1/2 rounded-md" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-3.5 w-14 rounded-md" />
      </div>
    </div>
  );
}
