"use client";

import { useState } from "react";
import { Dropdown } from "@/shared/components/Dropdown";
import {
  useApproveReturn,
  useRejectReturn,
  useIssueReturnRefund,
} from "../hooks/useReturns";
import {
  RETURN_STATUS_STYLES,
  RETURN_REASON_OPTIONS,
  formatStatusLabel,
  formatMoney,
} from "../lib/presentation";
import type { ReturnStatus, RefundStatus } from "../contracts/returns.contract";

type ReturnActionsProps = {
  returnId: string;
  orderId: string;
  status: ReturnStatus;
  notes: string | null;
  refund: { id: string; amount: string; status: RefundStatus } | null;
  orderTotal: string;
  currency: string;
  /** Fires after a refund is actually issued — lets the order page refresh its own status (may have flipped to REFUNDED). */
  onRefundIssued?: () => void;
};

/**
 * The one real action row for a return — approve/reject while PENDING, issue
 * a refund once APPROVED, or a plain summary once COMPLETED/REJECTED. Used
 * identically from the Returns queue (ReturnsTable) and from a single
 * order's embedded Returns section, so it never assumes anything beyond
 * what both call sites can supply.
 */
export function ReturnActions({
  returnId,
  orderId,
  status,
  notes,
  refund,
  orderTotal,
  currency,
  onRefundIssued,
}: ReturnActionsProps) {
  const style = RETURN_STATUS_STYLES[status];
  const approve = useApproveReturn();
  const reject = useRejectReturn();
  const issueRefund = useIssueReturnRefund();

  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const [amount, setAmount] = useState(() => Number(orderTotal).toFixed(2));
  const [reason, setReason] = useState(RETURN_REASON_OPTIONS[0].value);
  const [confirmingRefund, setConfirmingRefund] = useState(false);

  const statusBadge = (
    <span
      className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
      style={{ background: style.bg, color: style.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: style.color }}
      />
      {formatStatusLabel(status)}
    </span>
  );

  if (status === "PENDING") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge}
          {!rejecting && (
            <>
              <button
                type="button"
                disabled={approve.isPending}
                onClick={() => approve.mutate(returnId)}
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
                style={{ backgroundColor: "var(--shop-success)" }}
              >
                {approve.isPending ? "Approving…" : "Approve"}
              </button>
              <button
                type="button"
                disabled={reject.isPending}
                onClick={() => setRejecting(true)}
                className="rounded-full border border-[var(--shop-danger)]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-danger)] transition hover:bg-[var(--shop-danger-bg)] disabled:opacity-40"
              >
                Reject
              </button>
            </>
          )}
        </div>
        {rejecting && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-2.5">
            <input
              type="text"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason (optional)"
              className="min-w-[10rem] flex-1 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1 text-[11px] text-[var(--shop-text)]"
            />
            <button
              type="button"
              onClick={() => setRejecting(false)}
              disabled={reject.isPending}
              className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                reject.mutate(
                  { returnId, notes: rejectNotes.trim() || undefined },
                  { onSuccess: () => setRejecting(false) },
                )
              }
              disabled={reject.isPending}
              className="rounded-full bg-[var(--shop-danger)] px-3 py-1 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
            >
              {reject.isPending ? "Rejecting…" : "Confirm reject"}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">{statusBadge}</div>
        {confirmingRefund ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-3">
            <p className="min-w-[14rem] flex-1 text-[12.5px] font-semibold text-[var(--shop-danger)]">
              Refund {formatMoney(amount, currency)}? This issues a real Stripe
              refund and can&apos;t be undone.
            </p>
            <button
              type="button"
              onClick={() => setConfirmingRefund(false)}
              disabled={issueRefund.isPending}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                issueRefund.mutate(
                  { returnId, orderId, amount: Number(amount), reason },
                  {
                    onSuccess: () => {
                      setConfirmingRefund(false);
                      onRefundIssued?.();
                    },
                  },
                )
              }
              disabled={issueRefund.isPending}
              className="rounded-lg bg-[var(--shop-danger)] px-3 py-1.5 text-[11.5px] font-bold text-white hover:brightness-90 disabled:opacity-40"
            >
              {issueRefund.isPending ? "Refunding…" : "Issue refund"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-2.5">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Refund amount"
              className="w-24 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1 text-[11px] text-[var(--shop-text)]"
            />
            <Dropdown
              value={reason}
              options={RETURN_REASON_OPTIONS}
              onChange={setReason}
              size="sm"
              aria-label="Refund reason"
              className="w-40"
            />
            <button
              type="button"
              onClick={() => setConfirmingRefund(true)}
              disabled={!amount || Number(amount) <= 0}
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              Issue refund
            </button>
          </div>
        )}
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {statusBadge}
        {refund && (
          <span className="text-[11.5px] font-semibold text-[var(--shop-text)]">
            {formatMoney(refund.amount, currency)} refunded
          </span>
        )}
      </div>
    );
  }

  // REJECTED / RECEIVED — nothing left to do here.
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusBadge}
      {status === "REJECTED" && notes && (
        <span className="text-[11.5px] text-[var(--shop-text-muted)]">
          {notes}
        </span>
      )}
    </div>
  );
}
