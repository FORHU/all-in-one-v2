"use client";

import { Loader2 as Loader2Icon, Search as SearchIcon } from "lucide-react";
import { SupplierSearchResults } from "./SupplierSearchResults";
import { SupplierProductPreview } from "./SupplierProductPreview";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import type {
  SupplierSearchResult,
  SupplierProductDetail,
  CategoryOption,
} from "../contracts/product-sourcing.contract";

type SupplierProductSearchProps = {
  supplierId: string;
  onSupplierChange: (supplierId: string) => void;
  supplierOptions: readonly { id: string; label: string }[];
  query: string;
  onQueryChange: (query: string) => void;
  results: SupplierSearchResult[] | undefined;
  isSearching: boolean;
  isSearchFetching: boolean;
  isSearchPending: boolean;
  isSearchError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedExternalId: string | null;
  onSelect: (externalId: string | null) => void;
  detail: SupplierProductDetail | undefined;
  isDetailLoading: boolean;
  isDetailError: boolean;
  onImport: (externalId: string) => void;
  isImporting: boolean;
  categoryOptions: CategoryOption[] | undefined;
  categoryId: string;
  onCategoryChange: (id: string) => void;
};

export function SupplierProductSearch({
  supplierId,
  onSupplierChange,
  supplierOptions,
  query,
  onQueryChange,
  results,
  isSearching,
  isSearchFetching,
  isSearchPending,
  isSearchError,
  page,
  totalPages,
  onPageChange,
  selectedExternalId,
  onSelect,
  detail,
  isDetailLoading,
  isDetailError,
  onImport,
  isImporting,
  categoryOptions,
  categoryId,
  onCategoryChange,
}: SupplierProductSearchProps) {
  const isBusy = isSearching || isSearchFetching || isSearchPending;

  const supplierDropdownOptions: DropdownOption[] = supplierOptions.map(
    (option) => ({ value: option.id, label: option.label }),
  );

  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2">
          {isBusy ? (
            <Loader2Icon
              className="h-4 w-4 shrink-0 animate-spin text-[var(--shop-accent)]"
              aria-hidden="true"
            />
          ) : (
            <SearchIcon className="h-4 w-4 shrink-0 text-[var(--shop-text-muted)]" />
          )}
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder='Search the supplier&apos;s catalog, e.g. "shirt"'
            className="w-full bg-transparent text-xs text-[var(--shop-text)] outline-none"
          />
          {isBusy && (
            <span className="shrink-0 text-[11px] text-[var(--shop-text-muted)]">
              Searching…
            </span>
          )}
        </div>
        <Dropdown
          value={supplierId}
          options={supplierDropdownOptions}
          onChange={onSupplierChange}
          className="w-48 shrink-0"
          aria-label="Supplier"
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
          categoryOptions={categoryOptions}
          categoryId={categoryId}
          onCategoryChange={onCategoryChange}
        />
      )}

      <SupplierSearchResults
        query={query}
        results={results}
        isLoading={isSearching}
        isFetching={isSearchFetching}
        isError={isSearchError}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        selectedExternalId={selectedExternalId}
        onSelect={onSelect}
      />
    </div>
  );
}
