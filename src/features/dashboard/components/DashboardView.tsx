"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RevenueChart } from "./RevenueChart";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function DashboardPanel() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useDashboardStats();

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
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-lg border p-6"
          style={{
            borderColor: "var(--shop-danger)",
            backgroundColor: "var(--shop-danger-bg)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className="h-5 w-5 flex-shrink-0"
              style={{ color: "var(--shop-danger)" }}
              strokeWidth={2.25}
            />
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              Couldn&apos;t load dashboard stats
            </p>
          </div>
          <p className="text-sm text-[var(--shop-text-muted)]">
            {error instanceof Error
              ? error.message
              : "Something went wrong while fetching your metrics."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              strokeWidth={2.5}
            />
            {isRefetching ? "Retrying…" : "Try again"}
          </button>
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
