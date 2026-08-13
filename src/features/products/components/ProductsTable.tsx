"use client";

import { useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  Plus as PlusIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type {
  AdminProduct,
  ProductStatus,
} from "../contracts/products.contract";
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
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
  page,
  totalPages,
  onPageChange,
}: ProductsTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<AdminProduct | null>(null);
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; product: AdminProduct } | null
  >(null);

  const rows = products ?? [];
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected = rows.length > 0 && rows.every((p) => selected[p.id]);

  const toggleSelectAll = () => {
    const next = { ...selected };
    rows.forEach((p) => {
      next[p.id] = !allSelected;
    });
    setSelected(next);
  };

  return (
    <div>
      <div className="mb-3.5 flex justify-end">
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
        search={search}
        onSearchChange={onSearchChange}
        resultsCount={total}
      />

      <BulkToolbar
        selectedCount={selectedCount}
        onClear={() => setSelected({})}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[36px_2.4fr_1fr_1.1fr_1fr_1fr_0.9fr_40px] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
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
          <span>Variants</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
              />
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
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No products match your search.
          </p>
        ) : (
          rows.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              isSelected={Boolean(selected[p.id])}
              isExpanded={Boolean(expanded[p.id])}
              isMenuOpen={openMenu === p.id}
              onToggleSelect={() =>
                setSelected((s) => ({ ...s, [p.id]: !s[p.id] }))
              }
              onToggleExpand={() =>
                setExpanded((s) => ({ ...s, [p.id]: !s[p.id] }))
              }
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
