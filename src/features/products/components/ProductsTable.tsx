"use client";

import { useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  PackageSearch as PackageSearchIcon,
  Plus as PlusIcon,
  RotateCw as RotateCwIcon,
  RefreshCw as RefreshCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type {
  AdminProduct,
  ProductStatus,
} from "../contracts/products.contract";
import { useResyncAllProducts } from "../hooks/useProducts";
import { PRODUCT_GRID_COLS } from "../lib/presentation";
import { FilterBar } from "./FilterBar";
import { BulkToolbar } from "./BulkToolbar";
import { ProductRow } from "./ProductRow";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { ProductFormModal } from "./ProductFormModal";

type ProductsTableProps = {
  products: AdminProduct[] | undefined;
  total: number;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: "all" | ProductStatus;
  onStatusFilterChange: (status: "all" | ProductStatus) => void;
  categoryFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  brandFilter: string;
  onBrandFilterChange: (brand: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** True once any search/status/category/brand filter has narrowed the result set — distinguishes "no products yet" from "no products match." */
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** Bulk toolbar's "Add to collection" — receives the currently-selected rows so the app layer can hand them to the collections feature (cross-feature composition can't happen inside this feature per FAOS). */
  onAddSelectedToCollection: (products: AdminProduct[]) => void;
};

export function ProductsTable({
  products,
  total,
  isLoading,
  isError,
  error,
  onRetry,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  brandFilter,
  onBrandFilterChange,
  page,
  totalPages,
  onPageChange,
  hasActiveFilters,
  onClearFilters,
  onAddSelectedToCollection,
}: ProductsTableProps) {
  // Keyed by product id, but holds the full product object (not just a
  // boolean) — filter/page changes swap out `rows`, so a selection has to
  // carry its own data to survive being scrolled out of the current view.
  const [selected, setSelected] = useState<Record<string, AdminProduct>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<AdminProduct | null>(null);
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; product: AdminProduct } | null
  >(null);
  const { mutate: resyncAll, isPending: isResyncing } = useResyncAllProducts();

  const rows = products ?? [];
  const allSelected = rows.length > 0 && rows.every((p) => selected[p.id]);
  const selectedProducts = Object.values(selected);

  const toggleSelectAll = () => {
    const next = { ...selected };
    rows.forEach((p) => {
      if (allSelected) {
        delete next[p.id];
      } else {
        next[p.id] = p;
      }
    });
    setSelected(next);
  };

  const toggleProduct = (product: AdminProduct) => {
    setSelected((s) => {
      const next = { ...s };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      return next;
    });
  };

  const removeSelected = (productId: string) => {
    setSelected((s) => {
      const next = { ...s };
      delete next[productId];
      return next;
    });
  };

  return (
    <div>
      <div className="mb-3.5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => resyncAll(undefined)}
          disabled={isResyncing}
          title="Refresh stock and pricing for every already-imported supplier product"
          className="flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCwIcon
            className={`h-3.5 w-3.5 ${isResyncing ? "animate-spin" : ""}`}
            strokeWidth={2.5}
          />
          {isResyncing ? "Queuing…" : "Resync stock"}
        </button>
        <button
          type="button"
          onClick={() => setFormModal({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Add product
        </button>
      </div>

      <FilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={onCategoryFilterChange}
        brandFilter={brandFilter}
        onBrandFilterChange={onBrandFilterChange}
        search={search}
        onSearchChange={onSearchChange}
        resultsCount={total}
      />

      <BulkToolbar
        selectedProducts={selectedProducts}
        onClear={() => setSelected({})}
        onAddToCollection={() => onAddSelectedToCollection(selectedProducts)}
        onRemove={removeSelected}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div
          className={`grid items-center gap-4 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)] ${PRODUCT_GRID_COLS}`}
        >
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            aria-label="Select all products"
            className="accent-[var(--shop-ink)]"
          />
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`grid items-center gap-4 border-b border-[var(--shop-border)]/60 px-[18px] py-4 ${PRODUCT_GRID_COLS}`}
              >
                <div className="h-4 w-4 animate-pulse rounded bg-[var(--shop-bg-soft)]" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--shop-bg-soft)]" />
                </div>
                <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--shop-bg-soft)]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--shop-bg-soft)]" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--shop-bg-soft)]" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--shop-bg-soft)]" />
                <div className="h-5 w-5 animate-pulse rounded bg-[var(--shop-bg-soft)]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangleIcon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--shop-danger)" }}
                strokeWidth={2.25}
              />
              <p className="text-sm font-semibold text-[var(--shop-text)]">
                Couldn&apos;t load products
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching products."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-[18px] py-14 text-center">
            <PackageSearchIcon
              className="h-8 w-8 text-[var(--shop-text-muted)]"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              {hasActiveFilters
                ? "No products match these filters."
                : "No products yet."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-full border border-[var(--shop-border)] px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
              >
                Clear filters
              </button>
            ) : (
              <p className="text-xs text-[var(--shop-text-muted)]">
                Add your first product to start building the catalog.
              </p>
            )}
          </div>
        ) : (
          rows.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              isSelected={Boolean(selected[p.id])}
              isMenuOpen={openMenu === p.id}
              onToggleSelect={() => toggleProduct(p)}
              onToggleMenu={() => setOpenMenu(openMenu === p.id ? null : p.id)}
              onQuickView={() => {
                setQuickView(p);
                setOpenMenu(null);
              }}
              onEdit={() => {
                setFormModal({ mode: "edit", product: p });
                setOpenMenu(null);
              }}
            />
          ))
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {quickView && (
        <ProductQuickViewModal
          product={quickView}
          onClose={() => setQuickView(null)}
          onEdit={() => {
            setFormModal({ mode: "edit", product: quickView });
            setQuickView(null);
          }}
        />
      )}

      {formModal && (
        <ProductFormModal
          product={formModal.mode === "edit" ? formModal.product : undefined}
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  );
}
