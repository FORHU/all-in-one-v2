"use client";

import type { StatusCounts } from "../contracts/products.contract";

// GET /api/v2/products/admin returns a true, tenant-scoped product count in
// its pagination metadata (`total`), plus a catalog-wide `statusCounts`
// breakdown (unfiltered by the table's current search/status filter) —
// Published/Draft fill out the two remaining cards.
type ProductsStatsBarProps = {
  total: number;
  statusCounts: StatusCounts | undefined;
  isLoading: boolean;
};

const CARD_CLASS =
  "rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-[22px] py-[18px]";
const LABEL_CLASS =
  "mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";
const VALUE_CLASS = "shop-display text-[26px] font-bold";

export function ProductsStatsBar({
  total,
  statusCounts,
  isLoading,
}: ProductsStatsBarProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Total Products</p>
        <p className={VALUE_CLASS} style={{ color: "var(--shop-accent)" }}>
          {isLoading ? "—" : total}
        </p>
      </div>
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Published</p>
        <p className={VALUE_CLASS} style={{ color: "var(--shop-success)" }}>
          {isLoading ? "—" : (statusCounts?.PUBLISHED ?? 0)}
        </p>
      </div>
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Draft</p>
        <p className={VALUE_CLASS} style={{ color: "var(--shop-text-muted)" }}>
          {isLoading ? "—" : (statusCounts?.DRAFT ?? 0)}
        </p>
      </div>
    </div>
  );
}
