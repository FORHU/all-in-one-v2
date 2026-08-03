"use client";

import { X } from "lucide-react";
import type { Product } from "../data/mock-products";
import { STATUS_STYLES } from "../lib/presentation";

type ProductQuickViewModalProps = {
  product: Product;
  onClose: () => void;
};

export function ProductQuickViewModal({
  product,
  onClose,
}: ProductQuickViewModalProps) {
  const statusStyle = STATUS_STYLES[product.status];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shop-ink)]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[640px] overflow-auto rounded-2xl bg-[var(--shop-surface)]"
      >
        <div className="flex gap-5 border-b border-[var(--shop-border)] p-6">
          <div
            className="h-[88px] w-[88px] flex-shrink-0 rounded-xl"
            style={{
              background: `repeating-linear-gradient(45deg, ${product.swatchA}, ${product.swatchA} 5px, ${product.swatchB} 5px, ${product.swatchB} 10px)`,
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="shop-display mb-1 text-[19px] font-semibold text-[var(--shop-text)]">
              {product.name}
            </p>
            <p className="mb-2 font-mono text-xs text-[var(--shop-text-muted)]">
              {product.sku}
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusStyle.color }}
              />
              {product.status}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quick view"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[var(--shop-bg)] text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5 p-6">
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Price
            </p>
            <p className="shop-display text-xl font-bold text-[var(--shop-text)]">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Category
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {product.category}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Stock
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {product.stock} / {product.capacity} (
              {Math.round((product.stock / product.capacity) * 100)}%)
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Supplier
            </p>
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {product.supplier}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 p-6 pt-0">
          <button className="flex-1 rounded-lg bg-[var(--shop-ink)] py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)]">
            Edit product
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
