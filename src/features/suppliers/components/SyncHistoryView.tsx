"use client";

import { useEffect, useState } from "react";
import { SyncJobsTable } from "./SyncJobsTable";
import { useSyncJobs } from "../hooks/useSyncJobs";

const PAGE_SIZE = 20;

export function SyncHistoryView() {
  const [page, setPage] = useState(1);

  // tenantSlug (read inside useSyncJobs) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern OrdersListView uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useSyncJobs({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Sync History
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Review supplier sync runs and their status. Expand a run to see its
          log entries.
        </p>
      </div>
      <SyncJobsTable
        jobs={data?.items}
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
