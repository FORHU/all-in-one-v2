"use client";

import { Search as SearchIcon } from "lucide-react";
import type { SupplierSearchResult } from "../contracts/product-sourcing.contract";
import { formatPrice } from "../lib/presentation";

type SupplierSearchResultsProps = {
  query: string;
  results: SupplierSearchResult[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedExternalId: string | null;
  onSelect: (externalId: string) => void;
};

export function SupplierSearchResults({
  query,
  results,
  isLoading,
  isError,
  selectedExternalId,
  onSelect,
}: SupplierSearchResultsProps) {
  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] px-6 py-16 text-center">
        <SearchIcon className="h-5 w-5 text-[var(--shop-text-muted)]" />
        <p className="text-sm text-[var(--shop-text-muted)]">
          Search the supplier&apos;s live catalog to get started.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="px-1 py-8 text-center text-sm"
        style={{ color: "var(--shop-danger)" }}
      >
        Couldn&apos;t search the supplier&apos;s catalog. Try again in a moment.
      </p>
    );
  }

  if (!results || results.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-sm text-[var(--shop-text-muted)]">
        No products matched &quot;{query}&quot;.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
      {results.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className="flex flex-col gap-2.5 rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            borderColor:
              selectedExternalId === item.id
                ? "var(--shop-accent)"
                : "var(--shop-border)",
            background: "var(--shop-surface)",
          }}
        >
          {item.bigImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize
            <img
              src={item.bigImage}
              alt=""
              className="h-28 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="h-28 w-full rounded-lg bg-[var(--shop-bg-soft)]" />
          )}
          <p className="line-clamp-2 text-xs font-semibold text-[var(--shop-text)]">
            {item.nameEn || "Untitled product"}
          </p>
          <p className="text-xs text-[var(--shop-text-muted)]">
            {formatPrice(item.sellPrice)}
          </p>
        </button>
      ))}
    </div>
  );
}
