"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StatCard } from "../contracts/dashboard.contract";

interface StatsCardProps {
  stat: StatCard;
  index: number;
}

export function StatsCard({ stat, index }: StatsCardProps) {
  const TrendIcon =
    stat.trend === "up"
      ? TrendingUp
      : stat.trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    stat.trend === "up"
      ? "text-emerald-600"
      : stat.trend === "down"
        ? "text-red-600"
        : "text-zinc-500";

  const trendBg =
    stat.trend === "up"
      ? "bg-emerald-50"
      : stat.trend === "down"
        ? "bg-red-50"
        : "bg-zinc-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group rounded-lg border border-[#e5e7eb] bg-white p-6 transition-all hover:border-[#d1d5db] hover:shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-[#6b7280]">{stat.label}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${trendBg} ${trendColor}`}
        >
          <TrendIcon className="h-3 w-3" />
          {Math.abs(stat.change)}%
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-[#111827]">
        {stat.value}
      </p>
      <p className="mt-2 text-xs text-[#9ca3af]">vs. previous period</p>
    </motion.div>
  );
}
