"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal as MoreHorizontalIcon } from "lucide-react";
import type { AdminProduct } from "../contracts/products.contract";
import { useUpdateProduct, useResyncProduct } from "../hooks/useProducts";
import {
  PRODUCT_GRID_COLS,
  STATUS_STYLES,
  formatMoney,
  resolveThumbnailUrl,
} from "../lib/presentation";

// Rough height of the actions menu (4 items + container padding) — used to
// decide whether it has room to open downward before it's even rendered,
// since the table container clips anything that would render outside it.
const MENU_HEIGHT_ESTIMATE = 170;

type ProductRowProps = {
  product: AdminProduct;
  isSelected: boolean;
  isMenuOpen: boolean;
  onToggleSelect: () => void;
  onToggleMenu: () => void;
  onQuickView: () => void;
  onEdit: () => void;
};

export function ProductRow({
  product,
  isSelected,
  isMenuOpen,
  onToggleSelect,
  onToggleMenu,
  onQuickView,
  onEdit,
}: ProductRowProps) {
  const { mutate: archiveProduct, isPending: isArchiving } = useUpdateProduct(
    product.id,
  );
  const { mutate: resyncProduct, isPending: isResyncing } = useResyncProduct();
  const statusStyle = STATUS_STYLES[product.status];
  const stockColor = product.inStock
    ? "var(--shop-success)"
    : "var(--shop-danger)";
  const thumbnailUrl = resolveThumbnailUrl(product.thumbnailUrl);

  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpensUpward, setMenuOpensUpward] = useState(false);
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleMenu();
        menuTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, onToggleMenu]);

  const handleToggleMenu = () => {
    if (!isMenuOpen && menuTriggerRef.current) {
      const { bottom } = menuTriggerRef.current.getBoundingClientRect();
      setMenuOpensUpward(window.innerHeight - bottom < MENU_HEIGHT_ESTIMATE);
    }
    onToggleMenu();
  };

  return (
    <div
      className={[
        "grid items-start gap-4 border-b border-[var(--shop-border)]/60 px-[18px] py-4 transition-colors hover:bg-[var(--shop-bg)]",
        PRODUCT_GRID_COLS,
        isSelected ? "bg-[var(--shop-accent)]/8" : "bg-[var(--shop-surface)]",
      ].join(" ")}
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
            alt={product.title}
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[var(--shop-bg-soft)]" />
        )}
        <div className="min-w-0">
          <button
            type="button"
            onClick={onQuickView}
            className="block w-full truncate rounded text-left text-[13.5px] font-bold text-[var(--shop-text)] hover:text-[var(--shop-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shop-accent)] focus-visible:ring-offset-1"
          >
            {product.title}
          </button>
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
          ref={menuTriggerRef}
          onClick={handleToggleMenu}
          aria-label={`Actions for ${product.title}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={onToggleMenu}
            />
            <div
              role="menu"
              aria-label={`Actions for ${product.title}`}
              className={[
                "absolute right-0 z-50 w-[150px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg",
                menuOpensUpward ? "bottom-8" : "top-8",
              ].join(" ")}
            >
              <button
                role="menuitem"
                onClick={onEdit}
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
              >
                Edit
              </button>
              <button
                role="menuitem"
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
              >
                Duplicate
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  resyncProduct(product.id);
                  onToggleMenu();
                }}
                disabled={isResyncing}
                title="Refresh this product's stock and pricing from its supplier"
                className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResyncing ? "Refreshing…" : "Refresh stock"}
              </button>
              <button
                role="menuitem"
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
          </>
        )}
      </div>
    </div>
  );
}
