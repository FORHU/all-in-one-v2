"use client";

import { ChevronDown, MoreHorizontal } from "lucide-react";
import type { Product } from "../data/mock-products";
import { STATUS_STYLES, stockColor, trendBars } from "../lib/presentation";

type ProductRowProps = {
  product: Product;
  isSelected: boolean;
  isExpanded: boolean;
  isMenuOpen: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onToggleMenu: () => void;
  onQuickView: () => void;
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
}: ProductRowProps) {
  const pct = Math.round((product.stock / product.capacity) * 100);
  const sColor = stockColor(pct);
  const statusStyle = STATUS_STYLES[product.status];

  return (
    <div>
      <div
        className={[
          "grid grid-cols-[36px_2.4fr_1fr_0.9fr_1.3fr_1fr_1fr_40px] items-center gap-3 border-b border-[var(--shop-border)]/60 px-[18px] py-3.5 transition-colors hover:bg-[var(--shop-bg)]",
          isSelected ? "bg-[var(--shop-accent)]/8" : "bg-[var(--shop-surface)]",
        ].join(" ")}
        style={{ borderLeft: `3px solid ${sColor}` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          aria-label={`Select ${product.name}`}
          className="accent-[var(--shop-ink)]"
        />
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-lg"
            style={{
              background: `repeating-linear-gradient(45deg, ${product.swatchA}, ${product.swatchA} 4px, ${product.swatchB} 4px, ${product.swatchB} 8px)`,
            }}
          />
          <div className="min-w-0">
            <p
              onClick={onQuickView}
              className="cursor-pointer truncate text-[13.5px] font-bold text-[var(--shop-text)] hover:text-[var(--shop-accent)]"
            >
              {product.name}
            </p>
            <p className="mt-0.5 font-mono text-[11.5px] text-[var(--shop-text-muted)]">
              {product.sku}
            </p>
          </div>
        </div>
        <span className="text-xs text-[var(--shop-text-muted)]">
          {product.category}
        </span>
        <span className="shop-display text-[13.5px] font-semibold text-[var(--shop-text)]">
          ${product.price.toFixed(2)}
        </span>
        <div>
          <div className="mb-1 text-[11.5px] font-bold text-[var(--shop-text)]">
            {product.stock} / {product.capacity}
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-[var(--shop-bg-soft)]">
            <div
              className="h-full"
              style={{ width: `${pct}%`, background: sColor }}
            />
          </div>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: statusStyle.color }}
          />
          {product.status}
        </span>
        <div className="flex h-[22px] items-end gap-[2px]">
          {trendBars(product.trend).map((bar, i) => (
            <div
              key={i}
              className="w-1 rounded-[1px]"
              style={{ height: bar.h, background: bar.color }}
            />
          ))}
        </div>
        <div className="relative">
          <button
            onClick={onToggleMenu}
            aria-label={`Actions for ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-10 w-[150px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
              <button
                onClick={onQuickView}
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
              >
                Quick view
              </button>
              <button className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]">
                Edit
              </button>
              <button className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]">
                Duplicate
              </button>
              <button className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-accent-dark)] hover:bg-[var(--shop-accent)]/10">
                Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-3 gap-5 border-b border-[var(--shop-border)]/60 bg-[var(--shop-bg)] px-[18px] py-4 pl-[66px]">
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Supplier
            </p>
            <p className="text-[13px] font-semibold text-[var(--shop-text)]">
              {product.supplier}
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Variants
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <span
                  key={v}
                  className="rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--shop-text)]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              30-day sales
            </p>
            <p className="text-[13px] font-semibold text-[var(--shop-text)]">
              {product.sales30}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onToggleExpand}
        aria-label={isExpanded ? "Collapse details" : "Expand details"}
        className="flex w-full justify-center border-b border-[var(--shop-border)]/60 py-[3px] hover:bg-[var(--shop-bg)]"
      >
        <ChevronDown
          className="h-3 w-3 text-[var(--shop-text-muted)] transition-transform"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
    </div>
  );
}
