"use client";

import { Search as SearchIcon } from "lucide-react";
import { SupplierSearchResults } from "./SupplierSearchResults";
import { SupplierProductPreview } from "./SupplierProductPreview";
import type {
  SupplierSearchResult,
  SupplierProductDetail,
} from "../contracts/product-sourcing.contract";

type SupplierProductSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
  results: SupplierSearchResult[] | undefined;
  isSearching: boolean;
  isSearchError: boolean;
  selectedExternalId: string | null;
  onSelect: (externalId: string | null) => void;
  detail: SupplierProductDetail | undefined;
  isDetailLoading: boolean;
  isDetailError: boolean;
  onImport: (externalId: string) => void;
  isImporting: boolean;
};

export function SupplierProductSearch({
  query,
  onQueryChange,
  results,
  isSearching,
  isSearchError,
  selectedExternalId,
  onSelect,
  detail,
  isDetailLoading,
  isDetailError,
  onImport,
  isImporting,
}: SupplierProductSearchProps) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2">
        <SearchIcon className="h-4 w-4 shrink-0 text-[var(--shop-text-muted)]" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder='Search the supplier&apos;s catalog, e.g. "shirt"'
          className="w-full bg-transparent text-xs text-[var(--shop-text)] outline-none"
        />
      </div>

      {selectedExternalId && (
        <SupplierProductPreview
          externalId={selectedExternalId}
          detail={detail}
          isLoading={isDetailLoading}
          isError={isDetailError}
          onClose={() => onSelect(null)}
          onImport={() => onImport(selectedExternalId)}
          isImporting={isImporting}
        />
      )}

      <SupplierSearchResults
        query={query}
        results={results}
        isLoading={isSearching}
        isError={isSearchError}
        selectedExternalId={selectedExternalId}
        onSelect={onSelect}
      />
    </div>
  );
}
