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

/** One "123 label" segment — bolded/colored count, muted label. */
function Stat({
  value,
  label,
  color,
}: {
  value: number | "—";
  label: string;
  color: string;
}) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-bold" style={{ color }}>
        {value}
      </span>{" "}
      <span className="text-[var(--shop-text-muted)]">{label}</span>
    </span>
  );
}

// Collapsed from three padded cards into one inline stat pill — small
// enough to sit directly beside the page title instead of taking its own
// row, while still surfacing the same three counts at a glance and reading
// as one unit (same rounded-pill language as the Status/Stock badges in the
// table itself) rather than bare floating text.
export function ProductsStatsBar({
  total,
  statusCounts,
  isLoading,
}: ProductsStatsBarProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3.5 py-1.5 text-xs">
      <Stat
        value={isLoading ? "—" : total}
        label="total"
        color="var(--shop-accent)"
      />
      <span className="text-[var(--shop-border)]">·</span>
      <Stat
        value={isLoading ? "—" : (statusCounts?.PUBLISHED ?? 0)}
        label="published"
        color="var(--shop-success)"
      />
      <span className="text-[var(--shop-border)]">·</span>
      <Stat
        value={isLoading ? "—" : (statusCounts?.DRAFT ?? 0)}
        label="draft"
        color="var(--shop-text)"
      />
    </div>
  );
}
