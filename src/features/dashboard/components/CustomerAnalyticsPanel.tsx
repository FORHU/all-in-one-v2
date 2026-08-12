"use client";

import type { CustomerSales } from "../contracts/dashboard.contract";
import { formatCustomerName, formatMoney } from "../lib/presentation";

type CustomerAnalyticsPanelProps = {
  data: CustomerSales[];
  isLoading: boolean;
  isError: boolean;
};

export function CustomerAnalyticsPanel({
  data,
  isLoading,
  isError,
}: CustomerAnalyticsPanelProps) {
  return (
    <div className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6">
      <h3 className="shop-display mb-4 text-lg font-semibold uppercase tracking-wide text-[var(--shop-text)]">
        Top customers
      </h3>

      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-md bg-[var(--shop-bg-soft)]"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-[var(--shop-danger)]">
          Couldn&apos;t load customer analytics.
        </p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--shop-text-muted)]">
          No customer orders recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--shop-border)]">
          {data.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div>
                <p className="font-semibold text-[var(--shop-text)]">
                  {formatCustomerName(row.customer)}
                </p>
                <p className="text-xs text-[var(--shop-text-muted)]">
                  {row.totalOrders} orders · {formatMoney(row.avgOrderValue)}{" "}
                  avg
                </p>
              </div>
              <p className="font-semibold text-[var(--shop-text)]">
                {formatMoney(row.lifetimeSpend)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
