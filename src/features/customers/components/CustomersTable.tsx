"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  BadgeCheck as BadgeCheckIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { Pagination } from "@/shared/components/Pagination";
import type { Customer } from "../contracts/customers.contract";
import { CustomersStatsBar } from "./CustomersStatsBar";
import { CustomersFilterBar } from "./CustomersFilterBar";
import {
  STATUS_STYLES,
  VERIFIED_STYLES,
  formatJoined,
  formatLastActive,
  initials,
} from "../lib/presentation";

type CustomersTableProps = {
  accounts: Customer[] | undefined;
  total: number;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function CustomersTable({
  accounts,
  total,
  isLoading,
  isError,
  error,
  onRetry,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  onPageChange,
}: CustomersTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // The API already applies the search/status filter and returns only this
  // page's rows — no client-side filtering left to do.
  const rows = useMemo(
    () =>
      (accounts ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        orderCount: a.orderCount,
        isEmailVerified: a.isEmailVerified,
        status: a.isActive ? ("Active" as const) : ("Inactive" as const),
        lastActive: formatLastActive(a.lastLoginAt),
        joined: formatJoined(a.createdAt),
      })),
    [accounts],
  );

  const notAvailable = (message: string) => {
    notify.info(message);
    setOpenMenu(null);
  };

  return (
    <div>
      <CustomersStatsBar total={total} isLoading={isLoading} />
      <CustomersFilterBar
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[1.8fr_1.7fr_1.2fr_0.8fr_0.7fr_0.9fr_0.9fr_1.1fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Customer</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Status</span>
          <span>Orders</span>
          <span>Joined</span>
          <span>Last Active</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
              />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangleIcon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--shop-danger)" }}
                strokeWidth={2.25}
              />
              <p className="text-sm font-semibold text-[var(--shop-text)]">
                Couldn&apos;t load registered accounts
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching accounts."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No customers match your search.
          </p>
        ) : (
          rows.map((c) => {
            const statusStyle =
              STATUS_STYLES[c.status.toLowerCase()] ?? STATUS_STYLES.inactive;
            const verifiedStyle = c.isEmailVerified
              ? VERIFIED_STYLES.verified
              : VERIFIED_STYLES.unverified;

            return (
              <div
                key={c.id}
                className="grid grid-cols-[1.8fr_1.7fr_1.2fr_0.8fr_0.7fr_0.9fr_0.9fr_1.1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                    style={{ background: "var(--shop-accent)" }}
                  >
                    {initials(c.name)}
                  </div>
                  <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                    {c.name}
                  </p>
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-xs text-[var(--shop-text-muted)]">
                    {c.email}
                  </span>
                  {c.isEmailVerified && (
                    <BadgeCheckIcon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: verifiedStyle.color }}
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {c.phone ?? "—"}
                </span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusStyle.color }}
                  />
                  {c.status}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {c.orderCount}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {c.joined}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {c.lastActive}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      notAvailable("Customer profiles aren't wired up yet.")
                    }
                    className="text-xs font-semibold text-[var(--shop-accent)] hover:underline"
                  >
                    View profile
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === c.id ? null : c.id)
                      }
                      aria-label={`Actions for ${c.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </button>
                    {openMenu === c.id && (
                      <div className="absolute right-0 top-8 z-10 w-[170px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            notAvailable(
                              "Viewing order history isn't wired up yet.",
                            )
                          }
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                        >
                          View orders
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            notAvailable(
                              "Suspending accounts isn't wired up yet.",
                            )
                          }
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)]"
                        >
                          Suspend account
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
