"use client";

import { useState } from "react";
import { useRejectOrder } from "../hooks/useOrderDetail";

type RejectOrderButtonProps = {
  orderId: string;
};

/**
 * Declines to fulfill a paid order — the "no" counterpart to
 * PlaceWithSupplierButton at the same decision point. Always issues a real
 * refund (OrderService.rejectOrder), so the confirmation step collects an
 * optional reason and says explicitly what's about to happen, same
 * seriousness as PlaceWithSupplierButton's own confirm copy.
 */
export function RejectOrderButton({ orderId }: RejectOrderButtonProps) {
  const { mutate, isPending } = useRejectOrder(orderId);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-2">
        <span className="text-[11.5px] font-semibold text-[var(--shop-danger)]">
          Reject this order and refund the customer in full?
        </span>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          disabled={isPending}
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg)] px-2.5 py-1 text-[11.5px] text-[var(--shop-text)] outline-none disabled:opacity-40"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={() =>
              mutate(reason.trim() || undefined, {
                onSuccess: () => setConfirming(false),
              })
            }
            disabled={isPending}
            className="rounded-full bg-[var(--shop-danger)] px-3 py-1 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
          >
            {isPending ? "Rejecting…" : "Confirm — reject & refund"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full border border-[var(--shop-danger)]/30 px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--shop-danger)] transition hover:bg-[var(--shop-danger-bg)]"
    >
      Reject order
    </button>
  );
}
