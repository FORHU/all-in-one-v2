"use client";

import { useEffect, useState } from "react";
import { SupplierProductSearch } from "@/features/product-sourcing/components/SupplierProductSearch";
import {
  useSupplierSearch,
  useSupplierProductDetail,
  useImportProduct,
} from "@/features/product-sourcing/hooks/useProductSourcing";

const SEARCH_DEBOUNCE_MS = 300;

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedExternalId, setSelectedExternalId] = useState<string | null>(
    null,
  );

  // Debounce free-text search so we don't fire a request per keystroke —
  // each search hits the supplier's live API, not a local index.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // A changed search invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const {
    data: results,
    isLoading: isSearching,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useSupplierSearch(debouncedQuery, page);

  // True in the gap between a keystroke and the debounced request actually
  // firing, so the search input can show feedback with no dead gap.
  const isDebouncePending = query !== debouncedQuery;

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useSupplierProductDetail(selectedExternalId);

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
        onImport={(externalId) => importMutation.mutate(externalId)}
        isImporting={importMutation.isPending}
      />
    </div>
  );
}
