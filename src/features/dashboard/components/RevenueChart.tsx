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
import type { RevenueDataPoint } from "../contracts/dashboard.contract";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatCurrency(value: number) {
  return `$${(value / 1000).toFixed(0)}k`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6">
      <div className="mb-6">
        <h3 className="shop-display text-lg font-semibold uppercase tracking-wide text-[var(--shop-text)]">
          Revenue vs Expenses
        </h3>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Last 6 months
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--shop-ink)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--shop-ink)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--shop-accent)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--shop-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--shop-bg-soft)" />

          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-quaternary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
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
            formatter={(value) => [formatCurrency(Number(value))]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--shop-ink)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--shop-ink)" }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="var(--shop-accent)"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--shop-accent)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
