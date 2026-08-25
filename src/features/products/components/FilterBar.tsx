"use client";

import { useEffect } from "react";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { useCategoryOptions, useBrandCounts } from "../hooks/useProducts";
import type { ProductStatus } from "../contracts/products.contract";

// Collapsed from five always-visible pill buttons into one dropdown,
// matching the category/brand filters beside it — same filtering power in a
// fraction of the width.
const STATUS_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const ALL = "";

type FilterBarProps = {
  statusFilter: "all" | ProductStatus;
  onStatusFilterChange: (status: "all" | ProductStatus) => void;
  categoryFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  brandFilter: string;
  onBrandFilterChange: (brand: string) => void;
  resultsCount: number;
};

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  brandFilter,
  onBrandFilterChange,
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
      <div
        role="group"
        aria-label="Filters"
        className="flex flex-wrap items-center gap-2"
      >
        <Dropdown
          value={statusFilter}
          options={STATUS_DROPDOWN_OPTIONS}
          onChange={(v) => onStatusFilterChange(v as "all" | ProductStatus)}
          size="sm"
          className="w-[150px]"
          aria-label="Filter by status"
        />
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
      <span className="text-xs text-[var(--shop-text-muted)]">
        {resultsCount} results
      </span>
    </div>
  );
}
