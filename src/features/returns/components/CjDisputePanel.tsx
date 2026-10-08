"use client";

import {
  useFileCjDispute,
  useRefreshCjDispute,
  useConfirmCjDisputeOutcome,
} from "../hooks/useReturns";
import { formatMoney } from "../lib/presentation";
import type { ReturnDetail } from "../contracts/returns.contract";

/**
 * "Admin decides whether to involve CJ" — tries to recover AddictStyle's
 * cost from the supplier before ever refunding the customer out of pocket.
 * Same one-click-confirm weight as PlaceWithSupplierButton/RejectOrderButton
 * in the orders feature: no extra confirmation modal beyond the button
 * itself, since filing/confirming here is already one deliberate admin
 * click, not an accidental one.
 *
 * CJ's live (non-sandbox) dispute API is unverified per the adapter's own
 * doc comments, so this never auto-interprets CJ's raw status — Refresh
 * only pulls it into view; an admin reads it and explicitly clicks Confirm
 * Approved/Rejected. Never simulates success: a FAILED_TO_SUBMIT dispute
 * shows plainly as a failure with a Try Again, not a silent no-op.
 */
export function CjDisputePanel({
  returnId,
  detail,
}: {
  returnId: string;
  detail: ReturnDetail;
}) {
  const fileDispute = useFileCjDispute();
  const refresh = useRefreshCjDispute();
  const confirmOutcome = useConfirmCjDisputeOutcome();

  const latestDispute = detail.disputes[0] ?? null;
  const hasActiveDispute =
    latestDispute && latestDispute.status !== "FAILED_TO_SUBMIT";

  // Only meaningful once the request itself has been accepted — filing
  // before that would try to recover cost for a claim nothing's confirmed
  // yet, and the transition map (APPROVED -> CJ_DISPUTE_SUBMITTED) agrees.
  if (detail.status !== "APPROVED" && !hasActiveDispute) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        Supplier dispute
      </h3>

      {!latestDispute && detail.status === "APPROVED" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--shop-text-muted)]">
            Try to recover this cost from the supplier before refunding the
            customer directly.
          </p>
          <button
            type="button"
            disabled={fileDispute.isPending}
            onClick={() => fileDispute.mutate(returnId)}
            className="w-fit rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            {fileDispute.isPending ? "Filing…" : "File CJ dispute"}
          </button>
        </div>
      )}

      {latestDispute?.status === "FAILED_TO_SUBMIT" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-[var(--shop-danger)]">
            Could not file with the supplier.
          </p>
          {latestDispute.notes && (
            <p className="text-xs text-[var(--shop-text-muted)]">
              {latestDispute.notes}
            </p>
          )}
          {detail.status === "APPROVED" && (
            <button
              type="button"
              disabled={fileDispute.isPending}
              onClick={() => fileDispute.mutate(returnId)}
              className="w-fit rounded-full border border-[var(--shop-border)] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:opacity-40"
            >
              {fileDispute.isPending ? "Filing…" : "Try again"}
            </button>
          )}
        </div>
      )}

      {hasActiveDispute && latestDispute && (
        <div className="flex flex-col gap-3">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-[var(--shop-text-muted)]">
              <dt>Status</dt>
              <dd className="font-semibold text-[var(--shop-text)]">
                {latestDispute.status}
              </dd>
            </div>
            {latestDispute.cjRawStatus && (
              <div className="flex justify-between text-[var(--shop-text-muted)]">
                <dt>Supplier status (raw)</dt>
                <dd className="font-semibold text-[var(--shop-text)]">
                  {latestDispute.cjRawStatus}
                </dd>
              </div>
            )}
            {latestDispute.cjRefundAmount && (
              <div className="flex justify-between text-[var(--shop-text-muted)]">
                <dt>Supplier-offered amount</dt>
                <dd className="font-semibold text-[var(--shop-text)]">
                  {formatMoney(
                    latestDispute.cjRefundAmount,
                    detail.order.currency,
                  )}
                </dd>
              </div>
            )}
          </dl>

          {(latestDispute.status === "SUBMITTED" ||
            latestDispute.status === "UNDER_REVIEW") && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={refresh.isPending}
                onClick={() => refresh.mutate(returnId)}
                className="rounded-full border border-[var(--shop-border)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:opacity-40"
              >
                {refresh.isPending ? "Checking…" : "Refresh supplier status"}
              </button>
              {latestDispute.cjRawStatus && (
                <>
                  <button
                    type="button"
                    disabled={confirmOutcome.isPending}
                    onClick={() =>
                      confirmOutcome.mutate({
                        id: returnId,
                        outcome: "APPROVED",
                      })
                    }
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
                    style={{ backgroundColor: "var(--shop-success)" }}
                  >
                    Confirm approved
                  </button>
                  <button
                    type="button"
                    disabled={confirmOutcome.isPending}
                    onClick={() =>
                      confirmOutcome.mutate({
                        id: returnId,
                        outcome: "REJECTED",
                      })
                    }
                    className="rounded-full border border-[var(--shop-danger)]/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-danger)] transition hover:bg-[var(--shop-danger-bg)] disabled:opacity-40"
                  >
                    Confirm rejected
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
