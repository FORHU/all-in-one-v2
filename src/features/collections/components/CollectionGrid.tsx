"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/shared/components/Pagination";
import { useCollections } from "../hooks/useCollections";
import { CollectionCard } from "./CollectionCard";
import { CollectionGridSkeleton } from "./CollectionGridSkeleton";

const PAGE_SIZE = 24;

export function CollectionGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CategoryGrid uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useCollections({
    page,
    limit: PAGE_SIZE,
  });

  if (!mounted || isLoading) {
    return <CollectionGridSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load collections.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Defensive, same as CategoryGrid: the endpoint is expected to return
  // only top-level collections in `data.items` (children nest inside each
  // entry), but don't assume that holds if the backend ever changes.
  const topLevel = (data?.items ?? []).filter((c) => c.parentId === null);

  if (topLevel.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          No collections yet for this store.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        {topLevel.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
      <Pagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
