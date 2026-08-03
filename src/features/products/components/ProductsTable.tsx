"use client";

import { useMemo, useState } from "react";
import { PRODUCTS, type Product } from "../data/mock-products";
import { FilterBar } from "./FilterBar";
import { BulkToolbar } from "./BulkToolbar";
import { ProductRow } from "./ProductRow";
import { ProductQuickViewModal } from "./ProductQuickViewModal";

export function ProductsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Product["status"]>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.sku.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      return true;
    });
  }, [search, statusFilter, categoryFilter]);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected[p.id]);

  const toggleSelectAll = () => {
    const next = { ...selected };
    filtered.forEach((p) => {
      next[p.id] = !allSelected;
    });
    setSelected(next);
  };

  return (
    <div>
      <FilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        search={search}
        onSearchChange={setSearch}
        resultsCount={filtered.length}
      />

      <BulkToolbar
        selectedCount={selectedCount}
        onClear={() => setSelected({})}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[36px_2.4fr_1fr_0.9fr_1.3fr_1fr_1fr_40px] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
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
          <span>Trend</span>
          <span />
        </div>

        {filtered.map((p) => (
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
          />
        ))}
      </div>

      {quickView && (
        <ProductQuickViewModal
          product={quickView}
          onClose={() => setQuickView(null)}
        />
      )}
    </div>
  );
}
