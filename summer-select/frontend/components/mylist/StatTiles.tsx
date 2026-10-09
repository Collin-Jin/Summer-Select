"use client";

import { CheckCircle2, CircleDollarSign, Flame, Heart } from "lucide-react";
import { formatCost } from "@/lib/format/financial";
import type { Copy } from "./copy";

interface StatTilesProps {
  saved: number;
  submitted: number;
  dueSoon: number;
  fees: { total: number; unknown: number };
  copy: Copy;
}

/** Four at-a-glance numbers beside the closest-deadline card. */
export function StatTiles({ saved, submitted, dueSoon, fees, copy }: StatTilesProps) {
  const progress = saved === 0 ? 0 : Math.round((submitted / saved) * 100);
  const tiles = [
    {
      key: "saved",
      icon: <Heart className="h-4 w-4" />,
      label: copy.stats.saved,
      value: String(saved),
      color: "#B42318",
      bg: "#FDE7E7",
    },
    {
      key: "submitted",
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: copy.stats.submitted,
      value: `${submitted}/${saved}`,
      color: "#0B7A4B",
      bg: "#DDF5E9",
      bar: progress,
    },
    {
      key: "soon",
      icon: <Flame className="h-4 w-4" />,
      label: copy.stats.dueSoon,
      value: String(dueSoon),
      color: "#92600A",
      bg: "#FFF3CC",
    },
    {
      key: "fees",
      icon: <CircleDollarSign className="h-4 w-4" />,
      label: copy.stats.fees,
      value: formatCost(fees.total),
      sub: fees.unknown > 0 ? copy.stats.feesUnknown(fees.unknown) : undefined,
      color: "#4E527F",
      bg: "#EEEEF7",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((t, i) => (
        <div
          key={t.key}
          className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span
            className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ color: t.color, background: t.bg }}
          >
            {t.icon}
          </span>
          <p className="text-2xl font-bold tabular-nums text-slate-900">{t.value}</p>
          <p className="text-xs font-medium text-slate-500">{t.label}</p>
          {t.sub && <p className="text-[11px] text-slate-400">{t.sub}</p>}
          {t.bar !== undefined && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${t.bar}%`, background: t.color }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
