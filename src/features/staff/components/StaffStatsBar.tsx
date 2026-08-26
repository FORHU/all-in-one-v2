"use client";

import type { StaffRole } from "../lib/presentation";

type StaffStatsBarProps = {
  accounts: { role: StaffRole | null }[];
  isLoading: boolean;
};

/** One "N label" segment — bolded/colored count, muted label. Same shape as features/products' ProductsStatsBar. */
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

const STAT_ROLES: { role: StaffRole; label: string; color: string }[] = [
  { role: "Super Admin", label: "super admin", color: "var(--shop-accent)" },
  { role: "Admin", label: "admin", color: "var(--shop-success)" },
  { role: "Developer", label: "developer", color: "var(--shop-neutral)" },
];

// One inline pill beside the page title instead of three padded cards on
// their own row — same collapsed shape as ProductsStatsBar, so the two
// admin list pages read as one system rather than two different densities.
export function StaffStatsBar({ accounts, isLoading }: StaffStatsBarProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3.5 py-1.5 text-xs">
      {STAT_ROLES.map((stat, i) => {
        const count = accounts.filter((a) => a.role === stat.role).length;
        return (
          <span key={stat.role} className="flex items-center gap-2.5">
            {i > 0 && <span className="text-[var(--shop-border)]">·</span>}
            <Stat
              value={isLoading ? "—" : count}
              label={count === 1 ? stat.label : `${stat.label}s`}
              color={stat.color}
            />
          </span>
        );
      })}
    </div>
  );
}
