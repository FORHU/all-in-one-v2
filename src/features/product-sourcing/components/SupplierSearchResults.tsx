"use client";

import { Loader2 as Loader2Icon, Search as SearchIcon } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { SupplierSearchResult } from "../contracts/product-sourcing.contract";
import { formatPrice } from "../lib/presentation";

type SupplierSearchResultsProps = {
  query: string;
  results: SupplierSearchResult[] | undefined;
  isLoading: boolean;
  // True whenever a request is in flight, including refetches (page change,
  // new search) that keep the previous page's results on screen via
  // placeholderData — used to show a non-disruptive "updating" state
  // instead of replacing the grid with skeletons every time.
  isFetching: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedExternalId: string | null;
  onSelect: (externalId: string) => void;
};

export function SupplierSearchResults({
  query,
  results,
  isLoading,
  isFetching,
  isError,
  page,
  totalPages,
  onPageChange,
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
    <div>
      <div className="relative">
        {isFetching && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2.5 py-1 text-xs text-[var(--shop-text-muted)] shadow-sm">
            <Loader2Icon
              className="h-3.5 w-3.5 animate-spin"
              aria-hidden="true"
            />
            Updating…
          </div>
        )}
        <div
          aria-busy={isFetching}
          className={`grid grid-cols-2 gap-3.5 transition-opacity duration-150 sm:grid-cols-3 lg:grid-cols-4 ${
            isFetching ? "opacity-50" : "opacity-100"
          }`}
        >
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
              <div className="relative">
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
                {item.alreadyImported && (
                  <span
                    className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      color: "var(--shop-success)",
                      backgroundColor: "var(--shop-success-bg)",
                    }}
                  >
                    Imported
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs font-semibold text-[var(--shop-text)]">
                {item.nameEn || "Untitled product"}
              </p>
              <p className="text-xs font-bold text-[var(--shop-text)]">
                {formatPrice(item.sellPrice)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={isFetching}
      />
    </div>
  );
}
