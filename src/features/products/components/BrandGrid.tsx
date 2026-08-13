"use client";

import { useEffect, useState } from "react";
import { Pencil as PencilIcon } from "lucide-react";
import { useBrandCounts } from "../hooks/useProducts";
import { brandInitials, brandTileColor } from "../lib/presentation";
import { BrandActionsModal } from "./BrandActionsModal";
import { BrandPreviewPanel } from "./BrandPreviewPanel";
import type { BrandCount } from "../contracts/products.contract";

export function BrandGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CategoryGrid/CollectionGrid use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, error, refetch } = useBrandCounts();
  const [managing, setManaging] = useState<BrandCount | null>(null);
  // A tile click swaps this preview in place rather than navigating to
  // Products — browsing several brands in a row means clicking through the
  // list once, not leaving and hitting "back" after every one.
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[104px] animate-pulse rounded-2xl bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load brands.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const brands = data ?? [];

  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          No products have a brand set yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const isExpanded = expandedBrand === b.brand;
          return (
            <div key={b.brand} className="group relative">
              <button
                type="button"
                onClick={() => setExpandedBrand(isExpanded ? null : b.brand)}
                aria-expanded={isExpanded}
                className={[
                  "flex w-full flex-col gap-3.5 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  isExpanded
                    ? "border-[var(--shop-accent)] bg-[var(--shop-surface)]"
                    : "border-[var(--shop-border)] bg-[var(--shop-surface)]",
                ].join(" ")}
              >
                <div
                  className="shop-display flex h-11 w-11 items-center justify-center rounded-[10px] text-base font-bold text-white"
                  style={{ background: brandTileColor(b.brand) }}
                >
                  {brandInitials(b.brand)}
                </div>
                <div className="pr-8">
                  <p className="mb-0.5 text-sm font-bold text-[var(--shop-text)]">
                    {b.brand}
                  </p>
                  <p className="text-xs text-[var(--shop-text-muted)]">
                    {b.count} product{b.count === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setManaging(b);
                }}
                aria-label={`Manage ${b.brand}`}
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)]/90 text-[var(--shop-text-muted)] opacity-0 shadow-sm backdrop-blur transition hover:text-[var(--shop-accent)] focus-visible:opacity-100 group-hover:opacity-100"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {expandedBrand && (
        <BrandPreviewPanel
          brand={expandedBrand}
          onClose={() => setExpandedBrand(null)}
        />
      )}

      {managing && (
        <BrandActionsModal brand={managing} onClose={() => setManaging(null)} />
      )}
    </div>
  );
}
