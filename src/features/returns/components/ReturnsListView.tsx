"use client";

import { useEffect, useState } from "react";
import { ReturnsTable } from "./ReturnsTable";
import { useReturns } from "../hooks/useReturns";
import {
  RETURN_STATUS_VALUES,
  type ReturnStatus,
} from "../contracts/returns.contract";
import { RETURN_STATUS_STYLES, formatStatusLabel } from "../lib/presentation";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All statuses" },
  ...RETURN_STATUS_VALUES.map((s) => ({
    value: s,
    label: formatStatusLabel(s),
    indicatorColor: RETURN_STATUS_STYLES[s].color,
  })),
];

export function ReturnsListView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReturnStatus>("all");

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A changed filter invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // tenantSlug (read inside useReturns) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern OrdersListView uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useReturns({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
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
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order number, customer, or reason…"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        <Dropdown
          value={statusFilter}
          options={STATUS_DROPDOWN_OPTIONS}
          onChange={(v) => setStatusFilter(v as "all" | ReturnStatus)}
          size="sm"
          className="w-[168px]"
          aria-label="Filter by status"
        />
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
