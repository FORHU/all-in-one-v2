"use client";

import type { AdminProduct } from "../contracts/products.contract";
import {
  STATUS_STYLES,
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
            className="flex-1 rounded-lg bg-[var(--shop-ink)] py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)]"
          >
            Edit product
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
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
            alt=""
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
        </div>
      </div>
    </Modal>
  );
}
