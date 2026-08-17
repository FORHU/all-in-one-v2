"use client";

import { useState } from "react";
import { Dropdown } from "@/shared/components/Dropdown";
import { useReturnsByOrder, useCreateReturn } from "../hooks/useReturns";
import { ReturnActions } from "./ReturnActions";
import { RETURN_REASON_OPTIONS } from "../lib/presentation";

type OrderReturnsPanelProps = {
  orderId: string;
  /** Fires after a refund is issued — the order this refund belongs to may have just flipped to REFUNDED. */
  onChanged?: () => void;
};

/**
 * The Returns section embedded on an order's detail page. Lives entirely in
 * the returns feature and fetches its own copy of the order fields it needs
 * (GET /returns/order/:orderId already returns both) — composed as a
 * sibling of OrderDetailView at the app layer (see
 * app/(admin)/orders/[id]/page.tsx) rather than imported into it, since FAOS
 * forbids one feature importing another directly.
 */
export function OrderReturnsPanel({
  orderId,
  onChanged,
}: OrderReturnsPanelProps) {
  const { data, isLoading, isError, refetch } = useReturnsByOrder(orderId);
  const createReturn = useCreateReturn();

  const [startingReturn, setStartingReturn] = useState(false);
  const [reason, setReason] = useState(RETURN_REASON_OPTIONS[0].value);
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        Returns &amp; refunds
      </h3>

      {isLoading ? (
        <div className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]" />
      ) : isError || !data ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--shop-text-muted)]">
            Couldn&apos;t load returns for this order.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-[var(--shop-accent)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.returns.length === 0 ? (
            <p className="text-sm text-[var(--shop-text-muted)]">
              No return requests for this order.
            </p>
          ) : (
            data.returns.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-[var(--shop-border)] p-3"
              >
                <p className="mb-2 text-xs text-[var(--shop-text-muted)]">
                  {r.reason}
                </p>
                <ReturnActions
                  returnId={r.id}
                  orderId={orderId}
                  status={r.status}
                  notes={r.notes}
                  refund={r.refund}
                  orderTotal={data.order.totalAmount}
                  currency={data.order.currency}
                  onRefundIssued={onChanged}
                />
              </div>
            ))
          )}

          {!data.returns.some((r) => r.status !== "REJECTED") &&
            (data.order.customerId ? (
              startingReturn ? (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-2.5">
                  <Dropdown
                    value={reason}
                    options={RETURN_REASON_OPTIONS}
                    onChange={setReason}
                    size="sm"
                    aria-label="Return reason"
                    className="w-40"
                  />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    className="min-w-[10rem] flex-1 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1 text-[11px] text-[var(--shop-text)]"
                  />
                  <button
                    type="button"
                    onClick={() => setStartingReturn(false)}
                    disabled={createReturn.isPending}
                    className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      createReturn.mutate(
                        {
                          orderId,
                          customerId: data.order.customerId as string,
                          reason,
                          notes: notes.trim() || undefined,
                        },
                        {
                          onSuccess: () => {
                            setStartingReturn(false);
                            setNotes("");
                          },
                        },
                      )
                    }
                    disabled={createReturn.isPending}
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
                    style={{ backgroundColor: "var(--shop-accent-dark)" }}
                  >
                    {createReturn.isPending ? "Starting…" : "Start return"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setStartingReturn(true)}
                  className="rounded-full border border-[var(--shop-border)] px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
                >
                  Start a return
                </button>
              )
            ) : (
              <p className="text-xs text-[var(--shop-text-muted)]">
                This order has no linked customer account — a return can&apos;t
                be filed for a guest checkout.
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
