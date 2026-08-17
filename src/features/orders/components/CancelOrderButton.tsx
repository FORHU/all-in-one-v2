"use client";

import { useState } from "react";
import { useCancelOrder } from "../hooks/useOrderDetail";

type CancelOrderButtonProps = {
  orderId: string;
  /** Disables cancel — a captured payment means a refund is the only real option (see OrderService.cancelOrder's 409). */
  hasCapturedPayment: boolean;
};

export function CancelOrderButton({
  orderId,
  hasCapturedPayment,
}: CancelOrderButtonProps) {
  const { mutate, isPending } = useCancelOrder(orderId);
  const [confirming, setConfirming] = useState(false);

  if (hasCapturedPayment) {
    return (
      <span
        title="This order has a captured payment — issue a refund instead of cancelling."
        className="cursor-not-allowed rounded-full border border-[var(--shop-border)] px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--shop-text-muted)] opacity-60"
      >
        Cancel order
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11.5px] font-semibold text-[var(--shop-danger)]">
          Cancel this order?
        </span>
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
            mutate(undefined, { onSuccess: () => setConfirming(false) })
          }
          disabled={isPending}
          className="rounded-full bg-[var(--shop-danger)] px-3 py-1 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
        >
          {isPending ? "Cancelling…" : "Confirm cancel"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full border border-[var(--shop-danger)]/30 px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--shop-danger)] transition hover:bg-[var(--shop-danger-bg)]"
    >
      Cancel order
    </button>
  );
}
