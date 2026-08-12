"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { StatsCard, type DashboardStat } from "./StatsCard";
import { RevenueChart } from "./RevenueChart";
import { DateRangePicker } from "./DateRangePicker";
import { CategorySalesPanel } from "./CategorySalesPanel";
import { SupplierAnalyticsPanel } from "./SupplierAnalyticsPanel";
import { CustomerAnalyticsPanel } from "./CustomerAnalyticsPanel";
import {
  useCategorySales,
  useCustomerAnalytics,
  useDailySales,
  useSupplierAnalytics,
} from "../hooks/useAnalytics";
import { lastNDaysRange, type DateRange } from "../lib/date-range";
import { formatChartDate, formatMoney, toNumber } from "../lib/presentation";

export function DashboardPanel() {
  // tenantSlug (read inside the analytics hooks) comes from localStorage,
  // which the server always sees as empty — gate on `mounted` so the first
  // client render matches the server's, same pattern Products/Customers use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [range, setRange] = useState<DateRange>(() => lastNDaysRange(30));

  const daily = useDailySales(range.startDate, range.endDate);
  const categories = useCategorySales();
  const suppliers = useSupplierAnalytics();
  const customers = useCustomerAnalytics();

  const stats: DashboardStat[] = useMemo(() => {
    const points = daily.data ?? [];
    if (points.length === 0) return [];

    const totalRevenue = points.reduce(
      (sum, p) => sum + toNumber(p.revenueAmount),
      0,
    );
    const totalOrders = points.reduce((sum, p) => sum + p.ordersCount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activeDays = points.filter((p) => p.ordersCount > 0).length;
    const peakDay = points.reduce((max, p) =>
      toNumber(p.revenueAmount) > toNumber(max.revenueAmount) ? p : max,
    );

    return [
      {
        id: "revenue",
        label: "Total Revenue",
        value: formatMoney(totalRevenue),
        sublabel: `across ${points.length} days`,
      },
      {
        id: "orders",
        label: "Total Orders",
        value: totalOrders.toLocaleString(),
        sublabel: `${activeDays} active days`,
      },
      {
        id: "aov",
        label: "Avg Order Value",
        value: formatMoney(avgOrderValue),
        sublabel: "per order",
      },
      {
        id: "peak",
        label: "Best Day",
        value: formatMoney(peakDay.revenueAmount),
        sublabel: formatChartDate(peakDay.date),
      },
    ];
  }, [daily.data]);

  const isLoading = !mounted || daily.isLoading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            Overview of key metrics and revenue
          </p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
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
      ) : daily.isError ? (
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
            {daily.error instanceof Error
              ? daily.error.message
              : "Something went wrong while fetching your metrics."}
          </p>
          <button
            type="button"
            onClick={() => daily.refetch()}
            disabled={daily.isRefetching}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${daily.isRefetching ? "animate-spin" : ""}`}
              strokeWidth={2.5}
            />
            {daily.isRefetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatsCard key={stat.id} stat={stat} index={i} />
            ))}
          </div>
          <div className="mb-8">
            <RevenueChart data={daily.data ?? []} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <CategorySalesPanel
              data={categories.data ?? []}
              isLoading={!mounted || categories.isLoading}
              isError={categories.isError}
            />
            <SupplierAnalyticsPanel
              data={suppliers.data ?? []}
              isLoading={!mounted || suppliers.isLoading}
              isError={suppliers.isError}
            />
            <CustomerAnalyticsPanel
              data={customers.data ?? []}
              isLoading={!mounted || customers.isLoading}
              isError={customers.isError}
            />
          </div>
        </>
      )}
    </div>
  );
}
