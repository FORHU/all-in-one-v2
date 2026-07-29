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
      ? "text-emerald-700"
      : stat.trend === "down"
        ? "text-[var(--shop-accent-dark)]"
        : "text-[var(--shop-text-muted)]";

  const trendBg =
    stat.trend === "up"
      ? "bg-emerald-50"
      : stat.trend === "down"
        ? "bg-[var(--shop-accent)]/10"
        : "bg-[var(--shop-bg-soft)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6 transition-all hover:shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--shop-text-muted)]">
          {stat.label}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${trendBg} ${trendColor}`}
        >
          <TrendIcon className="h-3 w-3" />
          {Math.abs(stat.change)}%
        </span>
      </div>
      <p className="shop-display text-3xl font-bold tracking-tight text-[var(--shop-text)]">
        {stat.value}
      </p>
      <p className="mt-2 text-xs text-[var(--shop-text-muted)]">
        vs. previous period
      </p>
    </motion.div>
  );
}
