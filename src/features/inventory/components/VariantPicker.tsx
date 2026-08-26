"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import {
  useStockProductSearch,
  useStockVariantOptions,
} from "../hooks/useStock";
import type { StockProductSearchResult } from "../contracts/inventory.contract";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] py-2 pl-8 pr-3 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

type VariantPickerProps = {
  /** Selected variant id, or "" when nothing's picked yet — controlled, same pattern as a plain input. */
  variantId: string;
  onChange: (variantId: string) => void;
};

/**
 * Search-driven variant picker: find a product by name, then (if it has more
 * than one variant) pick which one. A single-variant product is selected
 * automatically — nothing to disambiguate. Admins don't know a variant's raw
 * id, so this replaces asking them to type one by hand.
 *
 * Extracted out of StockLookupView (the original /inventory/stock picker) so
 * SetStockForm and the transactions filter can reuse the exact same
 * search-and-pick behavior instead of a raw-UUID text input.
 */
export function VariantPicker({ variantId, onChange }: VariantPickerProps) {
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<StockProductSearchResult | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedProductQuery(productQuery), 300);
    return () => clearTimeout(id);
  }, [productQuery]);

  const { data: productResults } = useStockProductSearch(debouncedProductQuery);
  const { data: variantOptions } = useStockVariantOptions(
    selectedProduct?.id ?? "",
  );

  // A single-variant product has nothing to disambiguate — go straight to it.
  useEffect(() => {
    if (selectedProduct && variantOptions?.length === 1) {
      onChange(variantOptions[0].id);
    }
  }, [selectedProduct, variantOptions, onChange]);

  const handleSelectProduct = (product: StockProductSearchResult) => {
    setSelectedProduct(product);
    setProductQuery("");
    setDebouncedProductQuery("");
    onChange("");
  };

  const handleReset = () => {
    setSelectedProduct(null);
    onChange("");
    setProductQuery("");
    setDebouncedProductQuery("");
  };

  if (variantId) {
    return (
      <button
        type="button"
        onClick={handleReset}
        className="mb-4 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)] hover:text-[var(--shop-accent)]"
      >
        <XIcon className="h-3 w-3" strokeWidth={2.5} />
        Search a different product
      </button>
    );
  }

  return (
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
        <div className="mt-3 rounded-lg border border-[var(--shop-border)] p-3">
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
                  onClick={() => onChange(v.id)}
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
  );
}
