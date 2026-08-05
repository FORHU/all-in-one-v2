"use client";

import type { Tenant } from "../contracts/tenants.contract";

type TenantsStatsBarProps = {
  tenants: Tenant[];
};

function countByStatus(tenants: Tenant[], status: string) {
  return tenants.filter((t) => t.status.toLowerCase() === status).length;
}

export function TenantsStatsBar({ tenants }: TenantsStatsBarProps) {
  const stats = [
    {
      label: "Total Stores",
      value: tenants.length,
      color: "var(--shop-text)",
    },
    {
      label: "Active",
      value: countByStatus(tenants, "active"),
      color: "var(--shop-success)",
    },
    {
      label: "Onboarding",
      value: countByStatus(tenants, "onboarding"),
      color: "var(--shop-warning)",
    },
    {
      label: "Suspended",
      value: countByStatus(tenants, "suspended"),
      color: "var(--shop-danger)",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-[22px] py-[18px]"
        >
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            {stat.label}
          </p>
          <p
            className="shop-display text-[26px] font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
