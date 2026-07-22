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
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#111827]">
          Revenue vs Expenses
        </h3>
        <p className="mt-1 text-sm text-[#6b7280]">Last 6 months</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

          <XAxis
            dataKey="month"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#111827",
              fontSize: "13px",
            }}
            formatter={(value) => [formatCurrency(Number(value))]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#2563eb" }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#f43f5e" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
