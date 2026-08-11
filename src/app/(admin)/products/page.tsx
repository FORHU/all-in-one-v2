"use client";

import { useEffect, useState } from "react";
import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { useAdminProducts } from "@/features/products/hooks/useProducts";
import type { ProductStatus } from "@/features/products/contracts/products.contract";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>(
    "all",
  );

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A changed filter invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // tenantSlug (and therefore this query, gated on it inside
  // useAdminProducts) reads localStorage, which the server always sees as
  // empty — gate on `mounted` so the first client render matches the
  // server's, same pattern SupplierGrid/CollectionGrid/Customers use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useAdminProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

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
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
