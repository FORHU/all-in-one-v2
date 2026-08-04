"use client";

import { STAFF_MEMBERS, type StaffRole } from "../data/mock-staff";

function countByRole(role: StaffRole) {
  return STAFF_MEMBERS.filter((m) => m.role === role).length;
}

const STATS: { label: string; value: number; hint: string; color: string }[] = [
  {
    label: "Super Admins",
    value: countByRole("Super Admin"),
    hint: "Full platform access",
    color: "var(--shop-accent)",
  },
  {
    label: "Admins",
    value: countByRole("Admin"),
    hint: "Manage stores & orders",
    color: "var(--shop-success)",
  },
  {
    label: "Developers",
    value: countByRole("Developer"),
    hint: "API & integration access",
    color: "var(--shop-neutral)",
  },
];

export function StaffStatsBar() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STATS.map((stat) => (
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
          <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
            {stat.hint}
          </p>
        </div>
      ))}
    </div>
  );
}
