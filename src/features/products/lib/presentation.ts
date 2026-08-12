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

/**
 * Some products imported from CJ Dropshipping have a `thumbnailUrl` that's
 * actually a JSON-encoded array string (e.g. '["https://...","https://..."]')
 * — CJ's `/product/query` returns `productImage` in that shape, and the
 * backend import (product-import.service.ts) stored it verbatim instead of
 * extracting a single URL. Salvage those legacy rows here rather than
 * rendering the raw string as a broken <img src>; the backend fix only
 * covers new imports going forward.
 */
export function resolveThumbnailUrl(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      value =
        Array.isArray(parsed) && typeof parsed[0] === "string"
          ? parsed[0]
          : null;
    } catch {
      return null;
    }
  }
  return value && /^https?:\/\//.test(value) ? value : null;
}
