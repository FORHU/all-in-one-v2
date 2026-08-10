"use client";

import { useEffect, useState } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { useCustomers } from "@/features/customers/hooks/useCustomers";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A changed filter invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // tenantSlug (and therefore this query, gated on it inside useCustomers)
  // reads localStorage, which the server always sees as empty — gate on
  // `mounted` so the first client render matches the server's, same pattern
  // SupplierGrid/CollectionGrid use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useCustomers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "Active",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Customers
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            View customer profiles and account activity for this store.
          </p>
        </div>
      </div>
      <CustomersTable
        accounts={data?.items}
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
