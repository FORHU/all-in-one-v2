"use client";

import { useEffect, useState } from "react";
import { Plus as PlusIcon } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import { useCategories } from "../hooks/useCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryGridSkeleton } from "./CategoryGridSkeleton";
import { CategoryFormModal } from "./CategoryFormModal";
import type { Category } from "../contracts/categories.contract";

const PAGE_SIZE = 24;

type CategoryGridProps = {
  /** Rendered inline with the Add category button instead of its own stacked row above it — see CollectionGrid's identically-named prop. */
  heading?: { title: string; subtitle?: string };
};

export function CategoryGrid({ heading }: CategoryGridProps = {}) {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern AppSidebar uses for `me`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useCategories({
    page,
    limit: PAGE_SIZE,
  });
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; category: Category } | null
  >(null);

  if (!mounted || isLoading) {
    return <CategoryGridSkeleton />;
  }

  // The global toast (QueryProvider) already surfaces this, but per
  // api-error-guide.md's Component Error States pattern, the page also
  // needs a persistent inline state — otherwise a real failure and a
  // genuinely empty tenant render identically once the toast fades.
  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load categories.
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

  const topLevel = (data?.items ?? []).filter((c) => c.parentId === null);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        {heading && (
          <div className="mr-auto flex items-baseline gap-2">
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {heading.title}
            </h2>
            {heading.subtitle && (
              <p className="hidden text-sm text-[var(--shop-text-muted)] sm:block">
                {heading.subtitle}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setFormModal({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Add category
        </button>
      </div>

      {topLevel.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
          <p className="text-sm text-[var(--shop-text-muted)]">
            No categories yet for this store.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topLevel.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                onEdit={(category) => setFormModal({ mode: "edit", category })}
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
        <CategoryFormModal
          category={formModal.mode === "edit" ? formModal.category : undefined}
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  );
}
