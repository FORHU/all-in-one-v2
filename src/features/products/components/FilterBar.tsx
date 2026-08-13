"use client";

import { useEffect } from "react";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { useCategoryOptions, useBrandCounts } from "../hooks/useProducts";
import type { ProductStatus } from "../contracts/products.contract";

const STATUS_CHIPS: { key: "all" | ProductStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "READY", label: "Ready" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

const ALL = "";

type FilterBarProps = {
  statusFilter: "all" | ProductStatus;
  onStatusFilterChange: (status: "all" | ProductStatus) => void;
  categoryFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  brandFilter: string;
  onBrandFilterChange: (brand: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  resultsCount: number;
};

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  brandFilter,
  onBrandFilterChange,
  search,
  onSearchChange,
  resultsCount,
}: FilterBarProps) {
  const { data: categoryOptions } = useCategoryOptions();
  const { data: brandCounts } = useBrandCounts();

  // A category/brand filter can go stale mid-session — the category was
  // deleted, or the brand was renamed/cleared via BrandActionsModal — and
  // silently pin the table to zero results with no visible explanation.
  // Once the fresh options list has loaded, drop back to "All" the moment
  // the selected value isn't in it anymore. Guarded on `!== undefined` so
  // this can't fire while the list is still loading (an empty state would
  // otherwise look identical to "gone").
  useEffect(() => {
    if (categoryOptions === undefined || !categoryFilter) return;
    if (!categoryOptions.some((c) => c.id === categoryFilter)) {
      onCategoryFilterChange(ALL);
    }
  }, [categoryOptions, categoryFilter, onCategoryFilterChange]);

  useEffect(() => {
    if (brandCounts === undefined || !brandFilter) return;
    if (!brandCounts.some((b) => b.brand === brandFilter)) {
      onBrandFilterChange(ALL);
    }
  }, [brandCounts, brandFilter, onBrandFilterChange]);

  const categoryDropdownOptions: DropdownOption[] = [
    { value: ALL, label: "All categories" },
    ...(categoryOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const brandDropdownOptions: DropdownOption[] = [
    { value: ALL, label: "All brands" },
    ...(brandCounts ?? []).map((b) => ({
      value: b.brand,
      label: `${b.brand} (${b.count})`,
    })),
  ];

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_CHIPS.map((chip) => {
          const on = statusFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onStatusFilterChange(chip.key)}
              className="rounded-full border px-3.5 py-1.5 text-xs font-bold transition"
              style={{
                background: on ? "var(--shop-ink)" : "var(--shop-surface)",
                color: on ? "var(--shop-bg)" : "var(--shop-text-muted)",
                borderColor: on ? "var(--shop-ink)" : "var(--shop-border)",
              }}
            >
              {chip.label}
            </button>
          );
        })}
        <Dropdown
          value={categoryFilter}
          options={categoryDropdownOptions}
          onChange={onCategoryFilterChange}
          size="sm"
          className="w-[168px]"
          aria-label="Filter by category"
        />
        <Dropdown
          value={brandFilter}
          options={brandDropdownOptions}
          onChange={onBrandFilterChange}
          size="sm"
          className="w-[168px]"
          aria-label="Filter by brand"
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--shop-text-muted)]">
        <span>{resultsCount} results</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title or slug…"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
      </div>
    </div>
  );
}
