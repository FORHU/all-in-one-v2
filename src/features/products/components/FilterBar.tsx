"use client";

import type { ProductStatus } from "../contracts/products.contract";

const STATUS_CHIPS: { key: "all" | ProductStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "READY", label: "Ready" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

type FilterBarProps = {
  statusFilter: "all" | ProductStatus;
  onStatusFilterChange: (status: "all" | ProductStatus) => void;
  search: string;
  onSearchChange: (search: string) => void;
  resultsCount: number;
};

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
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
