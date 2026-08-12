"use client";

import { motion } from "framer-motion";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
};

interface StatsCardProps {
  stat: DashboardStat;
  index: number;
}

export function StatsCard({ stat, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6 transition-all hover:shadow-sm"
    >
      <p className="mb-4 text-sm font-medium text-[var(--shop-text-muted)]">
        {stat.label}
      </p>
      <p className="shop-display text-3xl font-bold tracking-tight text-[var(--shop-text)]">
        {stat.value}
      </p>
      {stat.sublabel && (
        <p className="mt-2 text-xs text-[var(--shop-text-muted)]">
          {stat.sublabel}
        </p>
      )}
    </motion.div>
  );
}
