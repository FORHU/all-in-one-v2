"use client";

import { useEffect, useRef, useState } from "react";
import { SupplierProductSearch } from "@/features/product-sourcing/components/SupplierProductSearch";
import {
  useSupplierSearch,
  useSupplierProductDetail,
  useImportProduct,
  useCategoryOptions,
  SUPPLIER_OPTIONS,
  type SupplierOptionId,
} from "@/features/product-sourcing/hooks/useProductSourcing";
import { UNSELECTED_CATEGORY } from "@/features/product-sourcing/lib/presentation";

const SEARCH_DEBOUNCE_MS = 300;

export default function ToolsPage() {
  const [supplierId, setSupplierId] = useState<SupplierOptionId>(
    SUPPLIER_OPTIONS[0].id,
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedExternalId, setSelectedExternalId] = useState<string | null>(
    null,
  );
  const [categoryId, setCategoryId] = useState(UNSELECTED_CATEGORY);

  // Debounce free-text search so we don't fire a request per keystroke —
  // each search hits the supplier's live API, not a local index.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // A changed search (or supplier) invalidates the current page number and
  // whatever product was previewed from the previous supplier's results.
  useEffect(() => {
    setPage(1);
    setSelectedExternalId(null);
    setCategoryId(UNSELECTED_CATEGORY);
  }, [debouncedQuery, supplierId]);

  // A different product selected within the same search results also resets
  // the category choice — it shouldn't carry over from whatever was picked
  // for the last previewed product, and re-blocks import until the admin
  // actively chooses (or re-confirms) a category for this one.
  useEffect(() => {
    setCategoryId(UNSELECTED_CATEGORY);
  }, [selectedExternalId]);

  const {
    data: results,
    isLoading: isSearching,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useSupplierSearch(supplierId, debouncedQuery, page);

  // True in the gap between a keystroke and the debounced request actually
  // firing, so the search input can show feedback with no dead gap.
  const isDebouncePending = query !== debouncedQuery;

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useSupplierProductDetail(supplierId, selectedExternalId);

  const { data: categoryOptions } = useCategoryOptions();

  // Best-guess default: once the preview's detail and the tenant's category
  // list have both loaded, pre-select the option whose name matches the
  // supplier's own category label (case-insensitively) — but only once per
  // selected product, so it doesn't clobber an admin's manual choice.
  const defaultAppliedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedExternalId || !detail?.categoryName || !categoryOptions)
      return;
    if (defaultAppliedForRef.current === selectedExternalId) return;
    defaultAppliedForRef.current = selectedExternalId;
    const match = categoryOptions.find(
      (c) => c.name.toLowerCase() === detail.categoryName?.toLowerCase(),
    );
    if (match) setCategoryId(match.id);
  }, [selectedExternalId, detail?.categoryName, categoryOptions]);

  const importMutation = useImportProduct();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Product Sync
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Search the connected supplier&apos;s live catalog and import a product
          into this store.
        </p>
      </div>
      <SupplierProductSearch
        supplierId={supplierId}
        onSupplierChange={(id) => setSupplierId(id as SupplierOptionId)}
        supplierOptions={SUPPLIER_OPTIONS}
        query={query}
        onQueryChange={setQuery}
        results={results?.items}
        isSearching={isSearching}
        isSearchFetching={isSearchFetching}
        isSearchPending={isDebouncePending}
        isSearchError={isSearchError}
        page={page}
        totalPages={results?.totalPages ?? 1}
        onPageChange={setPage}
        selectedExternalId={selectedExternalId}
        onSelect={setSelectedExternalId}
        detail={detail}
        isDetailLoading={isDetailLoading}
        isDetailError={isDetailError}
        onImport={(externalId) =>
          importMutation.mutate({
            supplierId,
            externalId,
            // Only reachable once the Import button is enabled, which
            // requires categoryId to have moved off UNSELECTED_CATEGORY —
            // "" is the admin's explicit "No category" choice at that point.
            categoryId: categoryId === "" ? null : categoryId,
          })
        }
        isImporting={importMutation.isPending}
        categoryOptions={categoryOptions}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
      />
    </div>
  );
}
