"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  Search as SearchIcon,
  X as XIcon,
} from "lucide-react";
import {
  useVariantStock,
  useStockProductSearch,
  useStockVariantOptions,
} from "../hooks/useStock";
import { SetStockForm } from "./SetStockForm";
import { StockSummaryTable } from "./StockSummaryTable";
import type { StockProductSearchResult } from "../contracts/inventory.contract";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] py-2 pl-8 pr-3 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--shop-text)]">{value}</p>
    </div>
  );
}

/**
 * /inventory/stock — cross-location stock rollup for one variant. Admins
 * don't know a variant's raw id, so this is search-driven: find a product by
 * name, then (if it has more than one variant) pick which one. A single
 * variant is selected automatically — nothing to disambiguate. A
 * `?variantId=` query param skips straight to the result, for a link from
 * elsewhere that already knows the id.
 */
export function StockLookupView() {
  const [mounted, setMounted] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<StockProductSearchResult | null>(null);
  const [variantId, setVariantId] = useState("");

  useEffect(() => {
    setMounted(true);
    // Read directly off window.location rather than useSearchParams — that
    // hook forces this page out of static rendering and requires a Suspense
    // boundary; a plain read inside this mount effect avoids both for a
    // one-time initial value. Same pattern as the admin Products page.
    const params = new URLSearchParams(window.location.search);
    const initialVariantId = params.get("variantId")?.trim();
    if (initialVariantId) setVariantId(initialVariantId);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedProductQuery(productQuery), 300);
    return () => clearTimeout(id);
  }, [productQuery]);

  const { data: productResults } = useStockProductSearch(debouncedProductQuery);
  const { data: variantOptions } = useStockVariantOptions(
    selectedProduct?.id ?? "",
  );

  // A single-variant product has nothing to disambiguate — go straight to its stock.
  useEffect(() => {
    if (selectedProduct && variantOptions?.length === 1) {
      setVariantId(variantOptions[0].id);
    }
  }, [selectedProduct, variantOptions]);

  const { data, isLoading, isError, error } = useVariantStock(variantId);

  const handleSelectProduct = (product: StockProductSearchResult) => {
    setSelectedProduct(product);
    setProductQuery("");
    setDebouncedProductQuery("");
    setVariantId("");
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setVariantId("");
    setProductQuery("");
    setDebouncedProductQuery("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Stock Lookup
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Cross-location onHand / reserved / available for one product variant.
        </p>
      </div>

      {variantId ? (
        <button
          type="button"
          onClick={handleReset}
          className="mb-4 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)] hover:text-[var(--shop-accent)]"
        >
          <XIcon className="h-3 w-3" strokeWidth={2.5} />
          Search a different product
        </button>
      ) : (
        <div className="mb-5 max-w-md">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--shop-text-muted)]" />
            <input
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value);
                setSelectedProduct(null);
              }}
              placeholder="Search products by name…"
              className={inputClass}
            />
            {debouncedProductQuery.trim().length >= 2 &&
              !selectedProduct &&
              (productResults?.length ?? 0) > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-64 overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg">
                  {productResults!.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                    >
                      {p.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                        <img
                          src={p.thumbnailUrl}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 shrink-0 rounded bg-[var(--shop-bg-soft)]" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
          </div>

          {selectedProduct && !variantId && (
            <div className="mt-3 max-w-md rounded-lg border border-[var(--shop-border)] p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
                Which variant of &quot;{selectedProduct.title}&quot;?
              </p>
              {!variantOptions ? (
                <p className="text-xs text-[var(--shop-text-muted)]">
                  Loading variants…
                </p>
              ) : variantOptions.length === 0 ? (
                <p className="text-xs text-[var(--shop-text-muted)]">
                  This product has no variants yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {variantOptions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-[var(--shop-bg-soft)]"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-semibold text-[var(--shop-text)]">
                          {v.title}
                        </span>
                        {v.sku && (
                          <span className="ml-2 text-[var(--shop-text-muted)]">
                            SKU {v.sku}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-[var(--shop-text-muted)]">
                        {v.stockAvailable} in stock
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!variantId ? null : !mounted || isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]" />
      ) : isError ? (
        <div role="alert" className="flex items-center gap-2.5 p-6">
          <AlertTriangleIcon
            className="h-5 w-5 flex-shrink-0"
            style={{ color: "var(--shop-danger)" }}
            strokeWidth={2.25}
          />
          <p className="text-sm text-[var(--shop-text-muted)]">
            {error instanceof Error
              ? error.message
              : "Couldn't find stock for that variant."}
          </p>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatChip label="On Hand" value={data.totalOnHand} />
            <StatChip label="Reserved" value={data.totalReserved} />
            <StatChip label="Available" value={data.totalAvailable} />
          </div>
          <SetStockForm fixedVariantId={variantId} />
          <StockSummaryTable rows={data.locations} />
        </div>
      ) : null}
    </div>
  );
}
