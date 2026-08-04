"use client";

import { type Product } from "../data/mock-products";

const STATUS_CHIPS: { key: "all" | Product["status"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Active", label: "Active" },
  { key: "Draft", label: "Draft" },
  { key: "Out of stock", label: "Low / Out" },
  { key: "Archived", label: "Archived" },
];

// Cross-feature imports are blocked, so this comes from features/categories
// via app/-level composition — ProductsTable receives it as a prop and
// threads it down here rather than FilterBar importing useCategories itself.
type FilterBarCategory = {
  slug: string;
  name: string;
};

type FilterBarProps = {
  statusFilter: "all" | Product["status"];
  onStatusFilterChange: (status: "all" | Product["status"]) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categories: FilterBarCategory[];
  search: string;
  onSearchChange: (search: string) => void;
  resultsCount: number;
};

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  search,
  onSearchChange,
  resultsCount,
}: FilterBarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const on = statusFilter === chip.key;
          return (
            <button
              key={chip.key}
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
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--shop-text-muted)]">
        <span>{resultsCount} results</span>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2.5 py-1.5 text-xs text-[var(--shop-text)] outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, SKU…"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
      </div>
    </div>
  );
}
