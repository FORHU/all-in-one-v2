"use client";

import Link from "next/link";
import { X as XIcon, ArrowRight as ArrowRightIcon } from "lucide-react";
import { useAdminProducts } from "../hooks/useProducts";
import { formatMoney, resolveThumbnailUrl } from "../lib/presentation";

const PREVIEW_LIMIT = 8;

type BrandPreviewPanelProps = {
  brand: string;
  onClose: () => void;
};

/**
 * Inline "what's in this brand" preview — lets browsing several brands in a
 * row swap the preview in place instead of navigating to the full Products
 * table and back for each one. That full table (search/sort/pagination/bulk
 * actions) is still one click away via "View all in Products" below.
 */
export function BrandPreviewPanel({ brand, onClose }: BrandPreviewPanelProps) {
  const { data, isLoading } = useAdminProducts({
    brand,
    limit: PREVIEW_LIMIT,
    page: 1,
  });

  return (
    <div className="mt-4 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="shop-display text-[15px] font-semibold text-[var(--shop-text)]">
          {brand}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(PREVIEW_LIMIT)].map((_, i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
            />
          ))}
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <p className="text-xs text-[var(--shop-text-muted)]">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(data?.items ?? []).map((p) => {
            const thumbnailUrl = resolveThumbnailUrl(p.thumbnailUrl);
            return (
              <div
                key={p.id}
                className="rounded-lg border border-[var(--shop-border)] p-2"
              >
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="mb-2 h-20 w-full rounded object-cover"
                  />
                ) : (
                  <div className="mb-2 h-20 w-full rounded bg-[var(--shop-bg-soft)]" />
                )}
                <p className="truncate text-[11.5px] font-semibold text-[var(--shop-text)]">
                  {p.title}
                </p>
                <p className="text-[11px] text-[var(--shop-text-muted)]">
                  {formatMoney(p.salePrice ?? p.price)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href={`/products?brand=${encodeURIComponent(brand)}`}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--shop-accent)] hover:underline"
      >
        View all {data?.total ?? ""} in Products
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
