"use client";

import { useEffect, useState } from "react";
import { OrdersTable } from "./OrdersTable";
import { useOrders } from "../hooks/useOrders";
import {
  ORDER_STATUS_VALUES,
  type OrderStatus,
} from "../contracts/orders.contract";
import { STATUS_STYLES, formatStatusLabel } from "../lib/presentation";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All statuses" },
  ...ORDER_STATUS_VALUES.map((s) => ({
    value: s,
    label: formatStatusLabel(s),
    indicatorColor: STATUS_STYLES[s].color,
  })),
];

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Only used for the unfiltered "All orders" view — when a caller pins
  // `status` (Processing/Completed pages), that's the fixed filter and this
  // dropdown isn't rendered at all.
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A changed filter invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // tenantSlug (read inside useOrders) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CustomersPage uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status ?? (statusFilter === "all" ? undefined : statusFilter),
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
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order number or customer…"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        {status === undefined && (
          <Dropdown
            value={statusFilter}
            options={STATUS_DROPDOWN_OPTIONS}
            onChange={(v) => setStatusFilter(v as "all" | OrderStatus)}
            size="sm"
            className="w-[168px]"
            aria-label="Filter by status"
          />
        )}
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
