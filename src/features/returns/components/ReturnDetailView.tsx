"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft as ArrowLeftIcon,
  CheckCircle2 as CheckCircle2Icon,
} from "lucide-react";
import { ApiError } from "@/shared/errors/api-error";
import {
  useReturnDetail,
  useStartReturnReview,
  useRequestReturnEvidence,
  useApproveReturnRequest,
  useRejectReturnRequest,
} from "../hooks/useReturns";
import { EvidenceGallery } from "./EvidenceGallery";
import { CjDisputePanel } from "./CjDisputePanel";
import { ProcessRefundPanel } from "./ProcessRefundPanel";
import {
  RETURN_STATUS_STYLES,
  REQUEST_TYPE_LABELS,
  formatStatusLabel,
  formatReturnDate,
  formatMoney,
  customerLabel,
} from "../lib/presentation";

/**
 * Admin review screen for one refund/replacement/return request — the
 * detail page ReturnsTable's own comment used to say wasn't needed (it was
 * right, until there was real per-request content: evidence, a status
 * audit trail, and a lifecycle with more than one admin decision point).
 * Step 2 of the new request flow: view, start review, request more
 * evidence, approve, or reject. CJ dispute/refund/replacement actions are
 * separate, later additions to this same screen.
 */
export function ReturnDetailView({ returnId }: { returnId: string }) {
  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useReturnDetail(returnId);

  const startReview = useStartReturnReview();
  const requestEvidence = useRequestReturnEvidence();
  const approve = useApproveReturnRequest();
  const reject = useRejectReturnRequest();

  const [requestingEvidence, setRequestingEvidence] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (error instanceof ApiError && error.category === "NOT_FOUND") {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          Request not found.
        </p>
        <Link
          href="/orders/returns"
          className="mt-3 inline-block text-xs font-medium text-[var(--shop-accent)]"
        >
          Back to returns
        </Link>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load this request.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const style = RETURN_STATUS_STYLES[detail.status];

  // statusHistory is ordered oldest-first (see ReturnRepository.findByIdWithDetail),
  // so the last entry is the most recent transition. Flags the exact moment
  // a customer's evidence resubmission (EVIDENCE_REQUIRED -> UNDER_REVIEW,
  // actor CUSTOMER — see ReturnService.addCustomerEvidence) is still the
  // reason this request is sitting at UNDER_REVIEW, so it doesn't look like
  // just another plain review queue entry. Naturally stops showing once an
  // admin acts again, since that appends a newer entry.
  const latestHistoryEntry =
    detail.statusHistory[detail.statusHistory.length - 1];
  const customerJustRespondedToEvidenceRequest =
    detail.status === "UNDER_REVIEW" &&
    latestHistoryEntry?.fromStatus === "EVIDENCE_REQUIRED" &&
    latestHistoryEntry?.actorRole === "CUSTOMER";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/orders/returns"
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] shadow-sm transition hover:border-[var(--shop-ink)]/20 hover:bg-[var(--shop-bg-soft)]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          All returns
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {REQUEST_TYPE_LABELS[detail.requestType]} — Order{" "}
              {detail.order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
              Requested {formatReturnDate(detail.createdAt)} by{" "}
              {customerLabel(detail.customer)}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold"
            style={{ background: style.bg, color: style.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: style.color }}
            />
            {formatStatusLabel(detail.status)}
          </span>
        </div>
      </div>

      {customerJustRespondedToEvidenceRequest && (
        <div
          className="flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-semibold"
          style={{
            borderColor: "var(--shop-success)",
            backgroundColor: "var(--shop-success-bg)",
            color: "var(--shop-success)",
          }}
        >
          <CheckCircle2Icon className="h-4 w-4 flex-none" strokeWidth={2.25} />
          Customer submitted the additional evidence you asked for — ready for
          review.
        </div>
      )}

      {/* Reason / description */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Reason
        </h3>
        <p className="text-sm font-semibold text-[var(--shop-text)]">
          {detail.reason}
        </p>
        {detail.description && (
          <p className="mt-1.5 text-sm text-[var(--shop-text-muted)]">
            {detail.description}
          </p>
        )}
        {detail.requestType === "RETURN" && detail.preferredResolution && (
          <p className="mt-2 text-xs text-[var(--shop-text-muted)]">
            Customer prefers:{" "}
            <span className="font-semibold text-[var(--shop-text)]">
              {REQUEST_TYPE_LABELS[detail.preferredResolution]}
            </span>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
          <span>Item</span>
          <span>Qty</span>
          <span>Unit price</span>
        </div>
        {detail.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[2fr_0.6fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                {item.orderItem.productTitle}
              </p>
              {(item.orderItem.variantTitle || item.orderItem.sku) && (
                <p className="truncate text-xs text-[var(--shop-text-muted)]">
                  {[item.orderItem.variantTitle, item.orderItem.sku]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <span className="text-xs text-[var(--shop-text-muted)]">
              {item.quantity}
            </span>
            <span className="text-xs text-[var(--shop-text-muted)]">
              {formatMoney(item.unitPriceSnapshot, detail.order.currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Evidence */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            Evidence
          </h3>
          {customerJustRespondedToEvidenceRequest && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: "var(--shop-success-bg)",
                color: "var(--shop-success)",
              }}
            >
              New since your request
            </span>
          )}
        </div>
        <EvidenceGallery evidence={detail.evidence} />
      </div>

      {/* Review actions */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Review
        </h3>

        {detail.status === "PENDING" && (
          <button
            type="button"
            disabled={startReview.isPending}
            onClick={() => startReview.mutate(returnId)}
            className="rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            {startReview.isPending ? "Starting…" : "Start review"}
          </button>
        )}

        {detail.status === "UNDER_REVIEW" && (
          <div className="flex flex-col gap-3">
            {!requestingEvidence && !rejecting && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ id: returnId })}
                  className="rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
                  style={{ backgroundColor: "var(--shop-success)" }}
                >
                  {approve.isPending ? "Approving…" : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => setRequestingEvidence(true)}
                  className="rounded-full border border-[var(--shop-border)] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
                >
                  Request more evidence
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="rounded-full border border-[var(--shop-danger)]/30 px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-danger)] transition hover:bg-[var(--shop-danger-bg)]"
                >
                  Reject
                </button>
              </div>
            )}

            {requestingEvidence && (
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-3">
                <textarea
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="What else do you need from the customer?"
                  rows={2}
                  className="resize-none rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-xs text-[var(--shop-text)]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestingEvidence(false);
                      setEvidenceNote("");
                    }}
                    disabled={requestEvidence.isPending}
                    className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={requestEvidence.isPending || !evidenceNote.trim()}
                    onClick={() =>
                      requestEvidence.mutate(
                        { id: returnId, note: evidenceNote.trim() },
                        { onSuccess: () => setRequestingEvidence(false) },
                      )
                    }
                    className="rounded-full bg-[var(--shop-accent-dark)] px-3 py-1.5 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
                  >
                    {requestEvidence.isPending ? "Sending…" : "Send request"}
                  </button>
                </div>
              </div>
            )}

            {rejecting && (
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why is this request being declined?"
                  rows={2}
                  className="resize-none rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-xs text-[var(--shop-text)]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(false);
                      setRejectReason("");
                    }}
                    disabled={reject.isPending}
                    className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={reject.isPending || !rejectReason.trim()}
                    onClick={() =>
                      reject.mutate(
                        { id: returnId, reason: rejectReason.trim() },
                        { onSuccess: () => setRejecting(false) },
                      )
                    }
                    className="rounded-full bg-[var(--shop-danger)] px-3 py-1.5 text-[11px] font-bold text-white hover:brightness-90 disabled:opacity-40"
                  >
                    {reject.isPending ? "Rejecting…" : "Confirm reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {detail.status === "EVIDENCE_REQUIRED" && (
          <p className="text-sm text-[var(--shop-text-muted)]">
            Waiting on the customer to upload more evidence. This moves back to
            Under Review automatically once they do.
          </p>
        )}

        {!["PENDING", "UNDER_REVIEW", "EVIDENCE_REQUIRED"].includes(
          detail.status,
        ) && (
          <p className="text-sm text-[var(--shop-text-muted)]">
            {detail.status === "REJECTED"
              ? "This request was declined."
              : detail.status === "APPROVED"
                ? "Approved — see below to try recovering the cost from the supplier, or process a refund directly."
                : ["CJ_APPROVED", "CJ_REJECTED", "RETURN_PROCESSING"].includes(
                      detail.status,
                    )
                  ? `Currently ${formatStatusLabel(detail.status).toLowerCase()} — see below to process a refund.`
                  : `Currently ${formatStatusLabel(detail.status).toLowerCase()} — replacement actions for this stage aren't wired up on this screen yet.`}
          </p>
        )}
      </div>

      <CjDisputePanel returnId={returnId} detail={detail} />
      <ProcessRefundPanel returnId={returnId} detail={detail} />

      {/* Status history */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Activity
        </h3>
        <div className="space-y-2">
          {detail.statusHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--shop-border)] pb-2 text-xs last:border-b-0 last:pb-0"
            >
              <span className="text-[var(--shop-text)]">
                {entry.fromStatus ? (
                  <>
                    {formatStatusLabel(entry.fromStatus)} →{" "}
                    {formatStatusLabel(entry.toStatus)}
                  </>
                ) : (
                  <>Created — {formatStatusLabel(entry.toStatus)}</>
                )}
                {entry.note && (
                  <span className="text-[var(--shop-text-muted)]">
                    {" "}
                    — {entry.note}
                  </span>
                )}
              </span>
              <span className="flex-none text-[var(--shop-text-muted)]">
                {entry.actorRole ?? "SYSTEM"} ·{" "}
                {formatReturnDate(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
