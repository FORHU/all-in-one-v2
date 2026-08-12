"use client";

import { useEffect, useState } from "react";
import { LocationsTable } from "./LocationsTable";
import { CreateLocationForm } from "./CreateLocationForm";
import { useLocations } from "../hooks/useLocations";

const PAGE_SIZE = 20;

/** /inventory — every physical or virtual stock location for this store. */
export function LocationsListView() {
  // tenantSlug (read inside useLocations) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern OrdersListView uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useLocations({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Inventory Locations
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Warehouses, retail stores, and supplier hubs holding stock for this
          store.
        </p>
      </div>

      <div className="mb-5">
        <CreateLocationForm />
      </div>

      <LocationsTable
        locations={data?.items}
        isLoading={!mounted || isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
