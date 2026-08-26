"use client";

import {
  AlertTriangle as AlertTriangleIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { InventoryTransaction } from "../contracts/inventory.contract";
import {
  TRANSACTION_TYPE_STYLES,
  formatEnumLabel,
  formatInventoryDateTime,
  formatQuantityDelta,
} from "../lib/presentation";

type TransactionsTableProps = {
  transactions: InventoryTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TransactionsTable({
  transactions,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: TransactionsTableProps) {
  const rows = transactions ?? [];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[1fr_0.8fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
          <span>Type</span>
          <span>Qty</span>
          <span>Stock</span>
          <span>Reference</span>
          <span>When</span>
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
                Couldn&apos;t load transactions
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching inventory transactions."}
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
            No inventory transactions match your search.
          </p>
        ) : (
          rows.map((t) => {
            const style = TRANSACTION_TYPE_STYLES[t.type];
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_0.8fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: style.bg, color: style.color }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: style.color }}
                  />
                  {formatEnumLabel(t.type)}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color:
                      t.quantity >= 0
                        ? "var(--shop-success)"
                        : "var(--shop-danger)",
                  }}
                >
                  {formatQuantityDelta(t.quantity)}
                </span>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {t.previousStock} → {t.newStock}
                </span>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {t.referenceId ?? "—"}
                </span>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {formatInventoryDateTime(t.createdAt)}
                </span>
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
