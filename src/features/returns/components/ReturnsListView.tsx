"use client";

import { useEffect, useState } from "react";
import { ReturnsTable } from "./ReturnsTable";
import { useReturns } from "../hooks/useReturns";

const PAGE_SIZE = 20;

export function ReturnsListView() {
  const [page, setPage] = useState(1);

  // tenantSlug (read inside useReturns) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern OrdersListView uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useReturns({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Returns
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            Review return requests and their refund status.
          </p>
        </div>
      </div>
      <ReturnsTable
        returns={data?.items}
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
