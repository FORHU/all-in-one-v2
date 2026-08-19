"use client";

import type { AdminProduct } from "../contracts/products.contract";
import { useProductVariants } from "../hooks/useProducts";
import {
  STATUS_STYLES,
  VISIBILITY_LABELS,
  formatMoney,
  resolveThumbnailUrl,
} from "../lib/presentation";
import { Modal } from "@/shared/components/Modal";

type ProductQuickViewModalProps = {
  product: AdminProduct;
  onClose: () => void;
  onEdit: () => void;
};

export function ProductQuickViewModal({
  product,
  onClose,
  onEdit,
}: ProductQuickViewModalProps) {
  const statusStyle = STATUS_STYLES[product.status];
  const thumbnailUrl = resolveThumbnailUrl(product.thumbnailUrl);
  // Only fetched while this modal is actually open — no point loading
  // variants for a row the admin never asked to look closer at.
  const { data: variants, isLoading: isLoadingVariants } = useProductVariants(
    product.id,
  );

  return (
    <Modal
      onClose={onClose}
      title={product.title}
      subtitle={product.slug}
      maxWidthClassName="max-w-[640px]"
      footer={
        <div className="flex gap-2.5">
          <button
            onClick={onEdit}
            className="flex-1 rounded-full bg-[var(--shop-ink)] py-2.5 text-[13px] font-bold text-[var(--shop-bg)] transition hover:bg-[var(--shop-ink-soft)]"
          >
            Edit product
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] py-2.5 text-[13px] font-bold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg)]"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex gap-5">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
          <img
            src={thumbnailUrl}
            alt={product.title}
            className="h-[88px] w-[88px] flex-shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="h-[88px] w-[88px] flex-shrink-0 rounded-xl bg-[var(--shop-bg-soft)]" />
        )}
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-5">
          <div className="col-span-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusStyle.color }}
              />
              {statusStyle.label}
            </span>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Price
            </p>
            <p className="shop-display text-xl font-bold text-[var(--shop-text)]">
              {formatMoney(product.salePrice ?? product.price)}
            </p>
            {product.salePrice !== null && product.price !== null && (
              <p className="text-xs text-[var(--shop-text-muted)] line-through">
                {formatMoney(product.price)}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Category
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {product.category?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Stock
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {product.inStock ? "In stock" : "Out of stock"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Visibility
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {VISIBILITY_LABELS[product.visibility]}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Last updated
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {product.images.length > 0 && (
        <div className="mt-5 border-t border-[var(--shop-border)] pt-5">
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            Photos ({product.images.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {product.images.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`${product.title} photo ${index + 1}`}
                className="h-14 w-14 rounded-lg border border-[var(--shop-border)] object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-[var(--shop-border)] pt-5">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Variants ({product.variantCount})
        </p>
        {isLoadingVariants ? (
          <p className="text-xs text-[var(--shop-text-muted)]">
            Loading variants…
          </p>
        ) : !variants || variants.length === 0 ? (
          <p className="text-xs text-[var(--shop-text-muted)]">No variants.</p>
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
                      alt={label}
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
    </Modal>
  );
}
