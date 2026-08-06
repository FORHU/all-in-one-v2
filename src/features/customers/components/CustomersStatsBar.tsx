"use client";

// Only the total is shown. Ideally this would come straight from the API's
// pagination metadata (`total`), but the backend doesn't filter by role yet
// (confirmed via DevTools — GET /api/v2/users?role=USER still returns
// admin/developer accounts), so `total` counts every role, not just
// customers. Until that's fixed backend-side, this reflects the current
// page's already role-filtered rows rather than a true cross-page count.
// Active/verified breakdowns aren't shown here for the same reason: an
// accurate count needs either the role filter working or a dedicated count
// endpoint, neither of which exists yet.
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
          Customers On This Page
        </p>
        <p
          className="shop-display text-[26px] font-bold"
          style={{ color: "var(--shop-accent)" }}
        >
          {isLoading ? "—" : total}
        </p>
        <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
          Backend doesn&apos;t filter by role yet — see code comment
        </p>
      </div>
    </div>
  );
}
