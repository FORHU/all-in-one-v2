import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import type { ProductSearchResult } from "../contracts/collections.contract";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

type CollectionProductSearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  debouncedQuery: string;
  categoryFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  categoryOptions: DropdownOption[];
  results: ProductSearchResult[];
  onAdd: (productId: string) => void;
  addDisabled: boolean;
};

/** Search-products-to-add row in CollectionFormModal, with a results dropdown and a product-category filter. */
export function CollectionProductSearchBar({
  query,
  onQueryChange,
  debouncedQuery,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  results,
  onAdd,
  addDisabled,
}: CollectionProductSearchBarProps) {
  const showResults =
    (debouncedQuery.trim().length >= 2 || categoryFilter) && results.length > 0;

  return (
    <div className="relative mb-3 flex gap-2">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search products to add…"
        className={`${inputClass} flex-1`}
      />
      <Dropdown
        value={categoryFilter}
        options={categoryOptions}
        onChange={onCategoryFilterChange}
        size="sm"
        className="w-36 shrink-0"
        aria-label="Filter by category"
      />
      {showResults && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-80 overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(p.id)}
              disabled={addDisabled}
              className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {p.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                <img
                  src={p.thumbnailUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-md bg-[var(--shop-bg-soft)]" />
              )}
              <span className="min-w-0 flex-1 truncate">{p.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
