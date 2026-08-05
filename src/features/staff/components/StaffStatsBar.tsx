"use client";

import type { StaffRole } from "../data/mock-staff";

type StaffStatsBarProps = {
  accounts: { role: StaffRole | null }[];
  isLoading: boolean;
};

const STAT_ROLES: {
  role: StaffRole;
  label: string;
  hint: string;
  color: string;
}[] = [
  {
    role: "Super Admin",
    label: "Super Admins",
    hint: "Full platform access",
    color: "var(--shop-accent)",
  },
  {
    role: "Admin",
    label: "Admins",
    hint: "Manage stores & orders",
    color: "var(--shop-success)",
  },
  {
    role: "Developer",
    label: "Developers",
    hint: "API & integration access",
    color: "var(--shop-neutral)",
  },
];

export function StaffStatsBar({ accounts, isLoading }: StaffStatsBarProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STAT_ROLES.map((stat) => {
        const count = accounts.filter((a) => a.role === stat.role).length;
        return (
          <div
            key={stat.role}
            className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-[22px] py-[18px]"
          >
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              {stat.label}
            </p>
            <p
              className="shop-display text-[26px] font-bold"
              style={{ color: stat.color }}
            >
              {isLoading ? "—" : count}
            </p>
            <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
              {stat.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
