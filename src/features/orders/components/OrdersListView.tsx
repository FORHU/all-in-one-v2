"use client";

import { useEffect, useState } from "react";
import { OrdersTable } from "./OrdersTable";
import { useOrders } from "../hooks/useOrders";
import type { OrderStatus } from "../contracts/orders.contract";

const PAGE_SIZE = 20;

type OrdersListViewProps = {
  title: string;
  description: string;
  /** Omit for the unfiltered "All orders" view. */
  status?: OrderStatus;
};

/** Shared by /orders, /orders/processing, /orders/completed — same table, different status filter. */
export function OrdersListView({
  title,
  description,
  status,
}: OrdersListViewProps) {
  const [page, setPage] = useState(1);

  // tenantSlug (read inside useOrders) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CustomersPage uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit: PAGE_SIZE,
    status,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      <OrdersTable
        orders={data?.items}
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
