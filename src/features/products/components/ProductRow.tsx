"use client";

import {
  ChevronDown as ChevronDownIcon,
  MoreHorizontal as MoreHorizontalIcon,
} from "lucide-react";
import type { AdminProduct } from "../contracts/products.contract";
import { useUpdateProduct, useProductVariants } from "../hooks/useProducts";
import {
  STATUS_STYLES,
  VISIBILITY_LABELS,
  formatMoney,
  resolveThumbnailUrl,
} from "../lib/presentation";

type ProductRowProps = {
  product: AdminProduct;
  isSelected: boolean;
  isExpanded: boolean;
  isMenuOpen: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onToggleMenu: () => void;
  onQuickView: () => void;
  onEdit: () => void;
};

export function ProductRow({
  product,
  isSelected,
  isExpanded,
  isMenuOpen,
  onToggleSelect,
  onToggleExpand,
  onToggleMenu,
  onQuickView,
  onEdit,
}: ProductRowProps) {
  const { mutate: archiveProduct, isPending: isArchiving } = useUpdateProduct(
    product.id,
  );
  // Only fetched once the row is actually expanded — no point firing a
  // variants query per row for every row on the page just to show a count
  // that's already on `product.variantCount`.
  const { data: variants, isLoading: isLoadingVariants } = useProductVariants(
    isExpanded ? product.id : "",
  );
  const statusStyle = STATUS_STYLES[product.status];
  const stockColor = product.inStock
    ? "var(--shop-success)"
    : "var(--shop-danger)";
  const thumbnailUrl = resolveThumbnailUrl(product.thumbnailUrl);

  return (
    <div>
      <div
        className={[
          "grid grid-cols-[36px_2.3fr_1.3fr_1fr_1fr_1fr_40px] items-start gap-4 border-b border-[var(--shop-border)]/60 px-[18px] py-4 transition-colors hover:bg-[var(--shop-bg)]",
          isSelected ? "bg-[var(--shop-accent)]/8" : "bg-[var(--shop-surface)]",
        ].join(" ")}
        style={{ borderLeft: `3px solid ${stockColor}` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          aria-label={`Select ${product.title}`}
          className="mt-1 accent-[var(--shop-ink)]"
        />
        <div className="flex min-w-0 items-center gap-3">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
            <img
              src={thumbnailUrl}
              alt=""
              className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[var(--shop-bg-soft)]" />
          )}
          <div className="min-w-0">
            <p
              onClick={onQuickView}
              className="cursor-pointer truncate text-[13.5px] font-bold text-[var(--shop-text)] hover:text-[var(--shop-accent)]"
            >
              {product.title}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11.5px] text-[var(--shop-text-muted)]">
              {product.slug}
            </p>
          </div>
        </div>
        <span className="text-xs leading-snug text-[var(--shop-text-muted)]">
          {product.category?.name ?? "—"}
        </span>
        <div>
          <div>
            <span className="shop-display text-[13.5px] font-semibold text-[var(--shop-text)]">
              {formatMoney(product.salePrice ?? product.price)}
            </span>
            {product.salePrice !== null && product.price !== null && (
              <span className="ml-1.5 text-[11.5px] text-[var(--shop-text-muted)] line-through">
                {formatMoney(product.price)}
              </span>
            )}
          </div>
          {/* Supplier cost this price was marked up from — only meaningful
              (and only shown) when it actually differs from the selling
              price, i.e. a pricing rule is actually doing something. */}
          {product.originalPrice !== null &&
            product.price !== null &&
            product.originalPrice !== product.price && (
              <p className="mt-0.5 text-[11px] text-[var(--shop-text-muted)]">
                Cost {formatMoney(product.originalPrice)}
              </p>
            )}
        </div>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{
            background: product.inStock
              ? "var(--shop-success-bg)"
              : "var(--shop-danger-bg)",
            color: stockColor,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: stockColor }}
          />
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: statusStyle.color }}
          />
          {statusStyle.label}
        </span>
        <div className="relative">
          <button
            onClick={onToggleMenu}
            aria-label={`Actions for ${product.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-10 w-[150px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
              <button
                onClick={onQuickView}
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
              >
                Quick view
              </button>
              <button
                onClick={onEdit}
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
              >
                Edit
              </button>
              <button className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]">
                Duplicate
              </button>
              <button
                onClick={() => archiveProduct({ status: "ARCHIVED" })}
                disabled={product.status === "ARCHIVED" || isArchiving}
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-accent-dark)] hover:bg-[var(--shop-accent)]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.status === "ARCHIVED"
                  ? "Archived"
                  : isArchiving
                    ? "Archiving…"
                    : "Archive"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-b border-[var(--shop-border)]/60 bg-[var(--shop-bg)] px-[18px] py-4 pl-[66px]">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
                Visibility
              </p>
              <p className="text-[13px] font-semibold text-[var(--shop-text)]">
                {VISIBILITY_LABELS[product.visibility]}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
                Last updated
              </p>
              <p className="text-[13px] font-semibold text-[var(--shop-text)]">
                {new Date(product.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {product.images.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
                Photos ({product.images.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {product.images.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt=""
                    className="h-14 w-14 rounded-lg border border-[var(--shop-border)] object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Variants ({product.variantCount})
            </p>
            {isLoadingVariants ? (
              <p className="text-xs text-[var(--shop-text-muted)]">
                Loading variants…
              </p>
            ) : !variants || variants.length === 0 ? (
              <p className="text-xs text-[var(--shop-text-muted)]">
                No variants.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const label =
                    [v.color, v.size].filter(Boolean).join(" / ") || v.title;
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] py-1.5 pl-1.5 pr-3"
                    >
                      {v.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                        <img
                          src={v.thumbnailUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-md bg-[var(--shop-bg-soft)]" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-[var(--shop-text)]">
                          {label}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              v.stockAvailable > 0
                                ? "var(--shop-success)"
                                : "var(--shop-danger)",
                          }}
                        >
                          {v.stockAvailable} in stock
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onToggleExpand}
        aria-label={isExpanded ? "Collapse details" : "Expand details"}
        className="flex w-full justify-center border-b border-[var(--shop-border)]/60 py-[3px] hover:bg-[var(--shop-bg)]"
      >
        <ChevronDownIcon
          className="h-3 w-3 text-[var(--shop-text-muted)] transition-transform"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
    </div>
  );
}
