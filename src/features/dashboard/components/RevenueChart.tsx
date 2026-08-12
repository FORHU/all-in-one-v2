"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DailySalesPoint } from "../contracts/dashboard.contract";
import {
  formatChartDate,
  formatCompactMoney,
  toNumber,
} from "../lib/presentation";

interface RevenueChartProps {
  data: DailySalesPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((point) => ({
    date: point.date,
    revenue: toNumber(point.revenueAmount),
    orders: point.ordersCount,
  }));

  return (
    <div className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6">
      <div className="mb-6">
        <h3 className="shop-display text-lg font-semibold uppercase tracking-wide text-[var(--shop-text)]">
          Revenue
        </h3>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Daily revenue for the selected range
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-[var(--shop-text-muted)]">
          No sales recorded for this range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--shop-ink)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--shop-ink)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--shop-bg-soft)" />

            <XAxis
              dataKey="date"
              tickFormatter={formatChartDate}
              tick={{ fill: "var(--text-quaternary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCompactMoney(value)}
              tick={{ fill: "var(--text-quaternary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "var(--shop-surface)",
                border: "1px solid var(--shop-border)",
                borderRadius: "8px",
                color: "var(--shop-text)",
                fontSize: "13px",
              }}
              labelFormatter={(label) => formatChartDate(String(label))}
              formatter={(value, name) =>
                name === "revenue"
                  ? [formatCompactMoney(Number(value)), "Revenue"]
                  : [value, "Orders"]
              }
            />

            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="var(--shop-ink)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--shop-ink)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
