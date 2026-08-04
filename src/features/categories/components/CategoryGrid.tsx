"use client";

import { useEffect, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryGridSkeleton } from "./CategoryGridSkeleton";

export function CategoryGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern AppSidebar uses for `me`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: categories, isLoading, error, refetch } = useCategories();

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

  const topLevel = (categories ?? []).filter((c) => c.parentId === null);

  if (topLevel.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          No categories yet for this store.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topLevel.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
