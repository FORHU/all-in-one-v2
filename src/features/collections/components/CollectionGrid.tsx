"use client";

import { useEffect, useState } from "react";
import { Plus as PlusIcon } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import { useCollections } from "../hooks/useCollections";
import { CollectionCard } from "./CollectionCard";
import { CollectionGridSkeleton } from "./CollectionGridSkeleton";
import { CollectionFormModal } from "./CollectionFormModal";
import type { Collection } from "../contracts/collections.contract";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

export function CollectionGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CategoryGrid uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, error, refetch } = useCollections({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; collection: Collection } | null
  >(null);

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

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collections by title…"
          className="w-72 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        <button
          type="button"
          onClick={() => setFormModal({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Add collection
        </button>
      </div>

      {topLevel.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
          <p className="text-sm text-[var(--shop-text-muted)]">
            {debouncedSearch
              ? `No collections match "${debouncedSearch}".`
              : "No collections yet for this store."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            {topLevel.map((c) => (
              <CollectionCard
                key={c.id}
                collection={c}
                onEdit={(collection) =>
                  setFormModal({ mode: "edit", collection })
                }
              />
            ))}
          </div>
          <Pagination
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}

      {formModal && (
        <CollectionFormModal
          collection={
            formModal.mode === "edit" ? formModal.collection : undefined
          }
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  );
}
