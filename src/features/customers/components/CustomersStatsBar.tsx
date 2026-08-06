"use client";

type CustomersStatsBarProps = {
  accounts: { isActive: boolean; isEmailVerified: boolean }[];
  isLoading: boolean;
};

export function CustomersStatsBar({
  accounts,
  isLoading,
}: CustomersStatsBarProps) {
  const stats = [
    {
      key: "total",
      label: "Total Customers",
      hint: "All registered accounts",
      color: "var(--shop-accent)",
      count: accounts.length,
    },
    {
      key: "active",
      label: "Active",
      hint: "Signed in at least once",
      color: "var(--shop-success)",
      count: accounts.filter((a) => a.isActive).length,
    },
    {
      key: "verified",
      label: "Verified Emails",
      hint: "Confirmed their email address",
      color: "var(--shop-neutral)",
      count: accounts.filter((a) => a.isEmailVerified).length,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-[22px] py-[18px]"
        >
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            {stat.label}
          </p>
          <p
            className="shop-display text-[26px] font-bold"
            style={{ color: stat.color }}
          >
            {isLoading ? "—" : stat.count}
          </p>
          <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
            {stat.hint}
          </p>
        </div>
      ))}
    </div>
  );
}
