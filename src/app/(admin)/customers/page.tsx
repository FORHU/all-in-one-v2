"use client";

import { useEffect, useState } from "react";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { useUsers } from "@/features/users/hooks/useUsers";

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

  const { data, isLoading, isError, error, refetch } = useUsers({
    role: "USER",
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "Active",
  });

  // `role` and `isActive` are sent to the backend as query params (see
  // useUsers) and trusted at face value — no client-side re-filtering.
  // Per review: the backend is the source of truth for these filters, not
  // the frontend. Confirmed against the backend source (user.controller.ts /
  // user.service.ts / user.repository.ts) that neither is actually applied
  // there yet, so until that lands, this list may include non-USER roles
  // and inactive accounts, and the status filter is a no-op. `search` is
  // unaffected — it's genuinely applied server-side via a Prisma OR on
  // email/username/name.
  const customerAccounts = data?.items.map((u) => ({
    id: u.id,
    name: u.name ?? u.username,
    email: u.email,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Customers
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            View customer profiles and account activity across the platform.
          </p>
        </div>
      </div>
      <CustomersTable
        accounts={customerAccounts}
        // Trusting the backend's count directly now — it may overcount
        // until role/isActive filtering is implemented there (see comment
        // above `customerAccounts`).
        total={data?.total ?? 0}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        page={page}
        // Also imprecise: totalPages is computed backend-side from every
        // role/status, not customers-only, since neither filter is applied
        // there. Next/Prev can undercount or overcount actual customer
        // pages until the backend supports these filters.
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
