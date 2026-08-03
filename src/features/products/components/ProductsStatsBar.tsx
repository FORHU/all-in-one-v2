"use client";

import { trendBars } from "../lib/presentation";

const STATS = [
  {
    label: "Total Products",
    value: "1,248",
    delta: "+4.2%",
    up: true,
    bars: [8, 9, 9, 10, 11, 11, 12],
  },
  {
    label: "Low Stock",
    value: "18",
    delta: "+3",
    up: false,
    bars: [4, 5, 6, 7, 8, 9, 9],
  },
  {
    label: "Out of Stock",
    value: "6",
    delta: "-2",
    up: true,
    bars: [9, 8, 8, 7, 6, 6, 5],
  },
  {
    label: "Avg. Margin",
    value: "42%",
    delta: "+1.1%",
    up: true,
    bars: [10, 10, 11, 11, 12, 12, 13],
  },
];

export function ProductsStatsBar() {
  return (
    <div className="mb-6 flex overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
      {STATS.map((stat, idx) => (
        <div
          key={stat.label}
          className="relative flex-1 p-[18px_22px] transition-colors hover:bg-[var(--shop-bg-soft)]"
        >
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="shop-display text-[26px] font-bold text-[var(--shop-text)]">
              {stat.value}
            </p>
            <span
              className="text-[11.5px] font-bold"
              style={{
                color: stat.up ? "var(--shop-success)" : "var(--shop-danger)",
              }}
            >
              {stat.delta}
            </span>
          </div>
          <div className="mt-2.5 flex h-4 items-end gap-[2px]">
            {trendBars(stat.bars).map((bar, i) => (
              <div
                key={i}
                className="w-[5px] rounded-[1px]"
                style={{ height: bar.h, background: bar.color }}
              />
            ))}
          </div>
          {idx < STATS.length - 1 && (
            <div className="absolute bottom-3.5 right-0 top-3.5 w-px bg-[var(--shop-border)]" />
          )}
        </div>
      ))}
    </div>
  );
}
