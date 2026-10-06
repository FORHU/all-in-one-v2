"use client";

import { useState } from "react";
import { useProcessRefund } from "../hooks/useReturns";
import { formatMoney } from "../lib/presentation";
import type { ReturnDetail } from "../contracts/returns.contract";

type ProcessRefundVariant =
  | "CJ"
  | "ADDICTSTYLE"
  | "CUSTOMER_NOT_REFUNDED"
  | "SPLIT"
  | undefined;

const REFUNDABLE_STATUSES = [
  "APPROVED",
  "CJ_APPROVED",
  "CJ_REJECTED",
  "RETURN_PROCESSING",
] as const;

const COST_COVERED_BY_OPTIONS = [
  { value: "", label: "Auto (based on supplier outcome)" },
  { value: "CJ", label: "Supplier (CJ)" },
  { value: "ADDICTSTYLE", label: "AddictStyle" },
  { value: "CUSTOMER_NOT_REFUNDED", label: "Customer not refunded" },
  { value: "SPLIT", label: "Split" },
] as const;

/**
 * "The actual refund" — real money moves here via Stripe, reachable from
 * APPROVED (skip-CJ path), CJ_APPROVED, CJ_REJECTED (AddictStyle eats the
 * cost), or RETURN_PROCESSING. Distinct from the legacy refund form embedded
 * in ReturnActions.tsx (which only ever worked from plain APPROVED and has
 * no cost-attribution bookkeeping) — this one records who ultimately paid
 * for it, separate from any CJ reimbursement already on file.
 */
export function ProcessRefundPanel({
  returnId,
  detail,
}: {
  returnId: string;
  detail: ReturnDetail;
}) {
  const processRefund = useProcessRefund();
  const [confirming, setConfirming] = useState(false);
  const [amount, setAmount] = useState(() => detail.order.totalAmount);
  const [note, setNote] = useState("");
  const [costCoveredBy, setCostCoveredBy] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  if (
    !REFUNDABLE_STATUSES.includes(
      detail.status as (typeof REFUNDABLE_STATUSES)[number],
    )
  ) {
    return null;
  }

  const maxRefundAmount = Number(detail.order.totalAmount);

  const validateAmount = (value: string): string | null => {
    const parsed = Number(value);
    if (value.trim() === "" || Number.isNaN(parsed))
      return "Enter a refund amount.";
    if (parsed <= 0) return "Refund amount must be greater than 0.";
    if (parsed > maxRefundAmount) {
      return `Refund can't exceed the order total of ${formatMoney(detail.order.totalAmount, detail.order.currency)}.`;
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        Process refund
      </h3>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-3">
          <p className="min-w-[14rem] flex-1 text-[12.5px] font-semibold text-[var(--shop-danger)]">
            Refund {formatMoney(amount, detail.order.currency)}? This issues a
            real Stripe refund and can&apos;t be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={processRefund.isPending}
            className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() =>
              processRefund.mutate(
                {
                  id: returnId,
                  amount: Number(amount),
                  note: note.trim() || undefined,
                  costCoveredBy: (costCoveredBy ||
                    undefined) as ProcessRefundVariant,
                },
                { onSuccess: () => setConfirming(false) },
              )
            }
            disabled={processRefund.isPending}
            className="rounded-lg bg-[var(--shop-danger)] px-3 py-1.5 text-[11.5px] font-bold text-white hover:brightness-90 disabled:opacity-40"
          >
            {processRefund.isPending ? "Refunding…" : "Issue refund"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="0.01"
              max={maxRefundAmount}
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (amountError) setAmountError(null);
              }}
              aria-label="Refund amount"
              aria-invalid={amountError ? true : undefined}
              className="w-28 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-xs text-[var(--shop-text)]"
            />
            <select
              value={costCoveredBy}
              onChange={(e) => setCostCoveredBy(e.target.value)}
              aria-label="Who covers the cost"
              className="rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-xs text-[var(--shop-text)]"
            >
              {COST_COVERED_BY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="min-w-[10rem] flex-1 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-xs text-[var(--shop-text)]"
            />
            <button
              type="button"
              onClick={() => {
                const err = validateAmount(amount);
                if (err) {
                  setAmountError(err);
                  return;
                }
                setAmountError(null);
                setConfirming(true);
              }}
              disabled={!amount || Number(amount) <= 0}
              className="rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              Issue refund
            </button>
          </div>
          {amountError && (
            <p className="text-[11px] text-[var(--shop-danger)]">
              {amountError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
