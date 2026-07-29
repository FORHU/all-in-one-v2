"use client";

import { StatsCard } from "./StatsCard";
import { RevenueChart } from "./RevenueChart";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function DashboardPanel() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Overview of key metrics and revenue
        </p>
      </div>

      {isLoading ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)]"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.stats.map((stat, i) => (
              <StatsCard key={stat.id} stat={stat} index={i} />
            ))}
          </div>
          {data?.revenueChart && <RevenueChart data={data.revenueChart} />}
        </>
      )}
    </div>
  );
}
