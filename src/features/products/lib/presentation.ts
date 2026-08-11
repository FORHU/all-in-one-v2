import type {
  ProductStatus,
  ProductVisibility,
} from "../contracts/products.contract";

export const STATUS_STYLES: Record<
  ProductStatus,
  { bg: string; color: string; label: string }
> = {
  DRAFT: {
    bg: "var(--shop-bg-soft)",
    color: "var(--shop-text-muted)",
    label: "Draft",
  },
  READY: {
    bg: "var(--shop-warning-bg)",
    color: "var(--shop-warning)",
    label: "Ready",
  },
  PUBLISHED: {
    bg: "var(--shop-success-bg)",
    color: "var(--shop-success)",
    label: "Published",
  },
  ARCHIVED: {
    bg: "var(--shop-neutral-bg)",
    color: "var(--shop-neutral)",
    label: "Archived",
  },
};

export const VISIBILITY_LABELS: Record<ProductVisibility, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  HIDDEN: "Hidden",
  MEMBERS_ONLY: "Members only",
};

export function formatMoney(value: number | null): string {
  return value === null ? "—" : `$${value.toFixed(2)}`;
}
