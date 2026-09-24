"use client";

import { useState } from "react";
import { usePlaceWithSupplier } from "../hooks/useOrderDetail";

type PlaceWithSupplierButtonProps = {
  orderId: string;
};

/**
 * Triggers CJOrderFulfillmentService.placeOrder — this is real, not a test:
 * it creates a real order on CJ's side and charges the store's real CJ
 * account balance. OrderDetailView only renders this button once (status
 * PROCESSING, no supplier order yet), but the confirmation step here is the
 * last guard before spending real money, so it says so explicitly rather
 * than using CancelOrderButton's lighter "are you sure?" copy.
 */
export function PlaceWithSupplierButton({
  orderId,
}: PlaceWithSupplierButtonProps) {
  const { mutate, isPending } = usePlaceWithSupplier(orderId);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11.5px] font-semibold text-[var(--shop-text)]">
          Place this order with the supplier and charge your CJ balance?
        </span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            mutate(undefined, { onSuccess: () => setConfirming(false) })
          }
          disabled={isPending}
          className="rounded-full bg-[var(--shop-accent)] px-3 py-1 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
        >
          {isPending ? "Placing…" : "Confirm — place order"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full border border-[var(--shop-accent)]/30 px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--shop-accent)] transition hover:bg-[var(--shop-accent)]/10"
    >
      Place with supplier
    </button>
  );
}
