"use client";

import { useEffect, useState } from "react";
import { useSuppliers } from "../hooks/useSuppliers";
import { SupplierCard } from "./SupplierCard";
import { SupplierGridSkeleton } from "./SupplierGridSkeleton";

export function SupplierGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CategoryGrid/CollectionGrid use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: suppliers, isLoading, error, refetch } = useSuppliers();

  if (!mounted || isLoading) {
    return <SupplierGridSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load suppliers.
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

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          No suppliers connected for this store yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((s) => (
        <SupplierCard key={s.id} supplier={s} />
      ))}
    </div>
  );
}
