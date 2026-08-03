import type { Product } from "../data/mock-products";

export const STATUS_STYLES: Record<
  Product["status"],
  { bg: string; color: string }
> = {
  Active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  Draft: { bg: "var(--shop-bg-soft)", color: "var(--shop-text-muted)" },
  "Out of stock": { bg: "var(--shop-danger-bg)", color: "var(--shop-danger)" },
  Archived: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export function stockColor(pct: number) {
  if (pct <= 15) return "var(--shop-danger)";
  if (pct <= 40) return "var(--shop-warning)";
  return "var(--shop-success)";
}

export function trendBars(
  trend: number[],
  lastColor = "var(--shop-accent)",
  restColor = "var(--shop-border)",
) {
  const max = Math.max(...trend);
  return trend.map((v, i) => ({
    h: Math.max(3, Math.round((v / max) * 20)),
    color: i === trend.length - 1 ? lastColor : restColor,
  }));
}
