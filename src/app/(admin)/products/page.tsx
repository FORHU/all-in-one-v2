"use client";

import { useEffect, useState } from "react";
import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { useAdminProducts } from "@/features/products/hooks/useProducts";
import type {
  AdminProduct,
  ProductStatus,
} from "@/features/products/contracts/products.contract";
import { CollectionFormModal } from "@/features/collections/components/CollectionFormModal";
import type { ProductSearchResult } from "@/features/collections/contracts/collections.contract";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A changed filter invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter, brandFilter]);

  // tenantSlug (and therefore this query, gated on it inside
  // useAdminProducts) reads localStorage, which the server always sees as
  // empty — gate on `mounted` so the first client render matches the
  // server's, same pattern SupplierGrid/CollectionGrid/Customers use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Picks up `?categoryId=`/`?brand=` set by a click-through link (e.g.
    // CategoryDetailView's "View products" link, or a BrandGrid tile).
    // Read directly off window.location rather than useSearchParams — that
    // hook forces this page out of static rendering and requires a
    // Suspense boundary; a plain read inside this mount effect avoids both
    // for a one-time initial value.
    const params = new URLSearchParams(window.location.search);
    const initialCategoryId = params.get("categoryId");
    const initialBrand = params.get("brand");
    if (initialCategoryId) setCategoryFilter(initialCategoryId);
    if (initialBrand) setBrandFilter(initialBrand);
  }, []);

  const { data, isLoading, isError, error, refetch } = useAdminProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    categoryId: categoryFilter || undefined,
    brand: brandFilter || undefined,
  });

  const hasActiveFilters = Boolean(
    debouncedSearch || statusFilter !== "all" || categoryFilter || brandFilter,
  );
  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("");
    setBrandFilter("");
  };

  // Bulk "Add to collection" from the products table — the products and
  // collections features can't import each other (FAOS cross-feature
  // boundary), so this app-layer page holds the bridge: it owns the modal
  // and translates the selected rows into the shape CollectionFormModal
  // expects.
  const [collectionDraftProducts, setCollectionDraftProducts] = useState<
    ProductSearchResult[] | null
  >(null);
  const handleAddSelectedToCollection = (products: AdminProduct[]) => {
    setCollectionDraftProducts(
      products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        thumbnailUrl: p.thumbnailUrl,
      })),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          All Products
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Browse and manage your full product catalog.
        </p>
      </div>
      <ProductsStatsBar
        total={data?.total ?? 0}
        statusCounts={data?.statusCounts}
        isLoading={!mounted || isLoading}
      />
      <ProductsTable
        products={data?.items}
        total={data?.total ?? 0}
        isLoading={!mounted || isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        brandFilter={brandFilter}
        onBrandFilterChange={setBrandFilter}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onAddSelectedToCollection={handleAddSelectedToCollection}
      />

      {collectionDraftProducts && (
        <CollectionFormModal
          initialProducts={collectionDraftProducts}
          initialMode="outfit"
          onClose={() => setCollectionDraftProducts(null)}
        />
      )}
    </div>
  );
}
