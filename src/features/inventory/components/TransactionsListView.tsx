"use client";

import { useCallback, useEffect, useState } from "react";
import { TransactionsTable } from "./TransactionsTable";
import { VariantPicker } from "./VariantPicker";
import { useTransactions } from "../hooks/useTransactions";

const PAGE_SIZE = 20;

/** /inventory/transactions — audit trail of onHand changes, optionally filtered to one variant. */
export function TransactionsListView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [variantId, setVariantId] = useState("");
  const [page, setPage] = useState(1);

  const handleVariantChange = useCallback((id: string) => {
    setVariantId(id);
    setPage(1);
  }, []);

  const { data, isLoading, isError, error, refetch } = useTransactions({
    variantId: variantId.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Inventory Transactions
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Every onHand change — purchases, sales, returns, supplier syncs, and
          manual adjustments.
        </p>
      </div>

      <VariantPicker variantId={variantId} onChange={handleVariantChange} />

      <TransactionsTable
        transactions={data?.items}
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
