"use client";

// Only the total is shown — GET /api/v2/customers returns a true,
// tenant-scoped customer count in its pagination metadata (`total`), so no
// client-side workaround is needed here. Active/verified breakdowns aren't
// shown since the endpoint doesn't return per-status aggregates, only rows.
type CustomersStatsBarProps = {
  total: number;
  isLoading: boolean;
};

export function CustomersStatsBar({
  total,
  isLoading,
}: CustomersStatsBarProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-[22px] py-[18px]">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Total Customers
        </p>
        <p
          className="shop-display text-[26px] font-bold"
          style={{ color: "var(--shop-accent)" }}
        >
          {isLoading ? "—" : total}
        </p>
      </div>
    </div>
  );
}
