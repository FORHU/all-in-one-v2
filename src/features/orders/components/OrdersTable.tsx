"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle as AlertTriangleIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { Order } from "../contracts/orders.contract";
import {
  STATUS_STYLES,
  formatOrderDate,
  formatMoney,
  customerLabel,
} from "../lib/presentation";

type OrdersTableProps = {
  orders: Order[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function OrdersTable({
  orders,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: OrdersTableProps) {
  // The API already applies search/status/pagination — no client-side filtering left to do.
  const rows = useMemo(() => orders ?? [], [orders]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[1.2fr_1.6fr_1fr_0.8fr_1fr_1fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Items</span>
          <span>Total</span>
          <span>Placed</span>
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
                Couldn&apos;t load orders
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching orders."}
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
            No orders match your search.
          </p>
        ) : (
          rows.map((o) => {
            const statusStyle = STATUS_STYLES[o.status];
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="grid grid-cols-[1.2fr_1.6fr_1fr_0.8fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 transition hover:bg-[var(--shop-bg-soft)] last:border-b-0"
              >
                <span className="truncate text-sm font-semibold text-[var(--shop-text)]">
                  {o.orderNumber}
                </span>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {customerLabel(o.customer)}
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
                  {o.status}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {o._count.items}
                </span>
                <span className="text-xs font-semibold text-[var(--shop-text)]">
                  {formatMoney(o.totalAmount, o.currency)}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {formatOrderDate(o.createdAt)}
                </span>
              </Link>
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
