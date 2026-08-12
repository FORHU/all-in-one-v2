"use client";

import type { StockLocationRow } from "../contracts/inventory.contract";
import { stockLevelStyle } from "../lib/presentation";

type StockSummaryTableProps = {
  rows: StockLocationRow[];
};

/** Per-location breakdown for one variant's stock summary. */
export function StockSummaryTable({ rows }: StockSummaryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
      <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
        <span>Location</span>
        <span>On Hand</span>
        <span>Reserved</span>
        <span>Available</span>
        <span>Reorder At</span>
      </div>

      {rows.length === 0 ? (
        <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
          No stock recorded for this variant at any location yet.
        </p>
      ) : (
        rows.map((row) => {
          const style = stockLevelStyle(row.available, row.reorderPoint);
          return (
            <div
              key={row.id}
              className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
            >
              <span className="truncate text-sm font-semibold text-[var(--shop-text)]">
                {row.location.name}{" "}
                <span className="font-normal text-[var(--shop-text-muted)]">
                  ({row.location.code})
                </span>
              </span>
              <span className="text-xs text-[var(--shop-text)]">
                {row.onHand}
              </span>
              <span className="text-xs text-[var(--shop-text-muted)]">
                {row.reserved}
              </span>
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{ background: style.bg, color: style.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: style.color }}
                />
                {row.available}
              </span>
              <span className="text-xs text-[var(--shop-text-muted)]">
                {row.reorderPoint}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
