"use client";

import type { LocationStockRow } from "../contracts/inventory.contract";
import { stockLevelStyle } from "../lib/presentation";

type LocationStocksTableProps = {
  stocks: LocationStockRow[];
};

/** Every variant currently stocked at one location — read-only, use SetStockForm above to change a row. */
export function LocationStocksTable({ stocks }: LocationStocksTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
      <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
        <span>Variant</span>
        <span>SKU</span>
        <span>On Hand</span>
        <span>Reserved</span>
        <span>Available</span>
        <span>Reorder At</span>
      </div>

      {stocks.length === 0 ? (
        <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
          No stock recorded at this location yet.
        </p>
      ) : (
        stocks.map((s) => {
          const style = stockLevelStyle(s.available, s.reorderPoint);
          return (
            <div
              key={s.id}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
            >
              <span className="truncate text-sm font-semibold text-[var(--shop-text)]">
                {s.variant.title}
              </span>
              <span className="truncate text-xs text-[var(--shop-text-muted)]">
                {s.variant.sku ?? "—"}
              </span>
              <span className="text-xs text-[var(--shop-text)]">
                {s.onHand}
              </span>
              <span className="text-xs text-[var(--shop-text-muted)]">
                {s.reserved}
              </span>
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{ background: style.bg, color: style.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: style.color }}
                />
                {s.available}
              </span>
              <span className="text-xs text-[var(--shop-text-muted)]">
                {s.reorderPoint}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
