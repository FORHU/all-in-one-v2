"use client";

import { useState } from "react";
import { X as XIcon } from "lucide-react";
import {
  useCreatePricingRule,
  useUpdatePricingRule,
  useDeletePricingRule,
} from "../hooks/usePricingRules";
import type { PricingRule } from "../contracts/pricing-rules.contract";
import type {
  PricingRuleWriteInput,
  PricingRuleSaleWriteInput,
} from "../api/pricing-rules.client";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

type PricingRuleFormModalProps = {
  /** Present = edit mode (seeded from this row). Absent = create mode. */
  rule?: PricingRule;
  onClose: () => void;
};

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/** ISO string -> `datetime-local` input value, in the browser's local time. */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `datetime-local` input value (no timezone, browser-local) -> ISO string. */
function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function PricingRuleFormModal({
  rule,
  onClose,
}: PricingRuleFormModalProps) {
  const isEdit = Boolean(rule);

  const [name, setName] = useState(rule?.name ?? "");
  const [markupValue, setMarkupValue] = useState(
    rule?.markupValue.toString() ?? "",
  );
  const [minimumProfit, setMinimumProfit] = useState(
    rule?.minimumProfit?.toString() ?? "",
  );
  const [saleEnabled, setSaleEnabled] = useState(Boolean(rule?.sale));
  const [saleType, setSaleType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    rule?.sale?.type ?? "PERCENTAGE",
  );
  const [saleValue, setSaleValue] = useState(
    rule?.sale?.value.toString() ?? "",
  );
  const [saleStartsAt, setSaleStartsAt] = useState(
    rule?.sale ? toDatetimeLocalValue(rule.sale.startsAt) : "",
  );
  const [saleEndsAt, setSaleEndsAt] = useState(
    rule?.sale ? toDatetimeLocalValue(rule.sale.endsAt) : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => {
      mapped[k] = v[0] ?? "Invalid";
    });
    setErrors(mapped);
  };

  const { mutate: create, isPending: isCreating } = useCreatePricingRule({
    onValidationError,
  });
  const { mutate: update, isPending: isUpdating } = useUpdatePricingRule(
    rule?.id ?? "",
    { onValidationError },
  );
  const { mutate: remove, isPending: isDeleting } = useDeletePricingRule();

  const isPending = isCreating || isUpdating || isDeleting;

  const saleFormValid =
    !saleEnabled ||
    (saleValue.trim() !== "" &&
      saleStartsAt !== "" &&
      saleEndsAt !== "" &&
      new Date(saleEndsAt) > new Date(saleStartsAt));

  const saleDirty =
    saleEnabled !== Boolean(rule?.sale) ||
    (saleEnabled &&
      (saleType !== (rule?.sale?.type ?? "PERCENTAGE") ||
        saleValue !== (rule?.sale?.value.toString() ?? "") ||
        saleStartsAt !==
          (rule?.sale ? toDatetimeLocalValue(rule.sale.startsAt) : "") ||
        saleEndsAt !==
          (rule?.sale ? toDatetimeLocalValue(rule.sale.endsAt) : "")));

  const dirty =
    !isEdit ||
    name !== rule!.name ||
    markupValue !== rule!.markupValue.toString() ||
    minimumProfit !== (rule!.minimumProfit?.toString() ?? "") ||
    saleDirty;

  const buildInput = (): PricingRuleWriteInput => {
    const sale: PricingRuleSaleWriteInput | null =
      saleEnabled && saleFormValid
        ? {
            type: saleType,
            value: Number(saleValue) || 0,
            startsAt: fromDatetimeLocalValue(saleStartsAt),
            endsAt: fromDatetimeLocalValue(saleEndsAt),
          }
        : null;

    return {
      name: name.trim(),
      markupValue: Number(markupValue) || 0,
      minimumProfit: parseOptionalNumber(minimumProfit),
      sale,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isEdit) {
      update(buildInput(), { onSuccess: onClose });
      return;
    }
    create(buildInput(), { onSuccess: onClose });
  };

  const canDelete = isEdit && !rule!.isDefault && rule!.productCount === 0;

  const handleConfirmDelete = () => {
    if (!rule) return;
    remove(rule.id, { onSuccess: onClose });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shop-ink)]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] overflow-auto rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--shop-border)] p-6">
          <p className="shop-display text-[17px] font-semibold text-[var(--shop-text)]">
            {isEdit ? "Edit pricing rule" : "New pricing rule"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--shop-bg)] text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard markup"
              disabled={isPending}
              className={inputClass}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Markup percentage</label>
            <div className="relative">
              <input
                value={markupValue}
                onChange={(e) => setMarkupValue(e.target.value)}
                placeholder="0"
                inputMode="decimal"
                disabled={isPending}
                className={`${inputClass} pr-7`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--shop-text-muted)]">
                %
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--shop-text-muted)]">
              Selling price = supplier cost × (1 + this percentage). Applied to
              variants that have a known cost — imported/dropship variants, not
              manually priced ones.
            </p>
            {errors.markupValue && (
              <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
                {errors.markupValue}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Minimum profit (optional)</label>
            <input
              value={minimumProfit}
              onChange={(e) => setMinimumProfit(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              disabled={isPending}
              className={inputClass}
            />
            <p className="mt-1.5 text-[11px] text-[var(--shop-text-muted)]">
              Floor on profit per unit — the price is bumped up if the
              percentage alone would leave less than this.
            </p>
          </div>

          <div className="border-t border-[var(--shop-border)] pt-4">
            {isEdit && rule!.sale && (
              <p
                className="mb-2.5 text-[11px] font-semibold"
                style={{
                  color: rule!.sale.isActive
                    ? "var(--shop-success)"
                    : "var(--shop-text-muted)",
                }}
              >
                {rule!.sale.isActive
                  ? "Sale is currently active."
                  : new Date(rule!.sale.endsAt) < new Date()
                    ? "Sale has ended."
                    : "Sale is scheduled — not active yet."}
              </p>
            )}

            <label className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              <input
                type="checkbox"
                checked={saleEnabled}
                onChange={(e) => setSaleEnabled(e.target.checked)}
                disabled={isPending}
                className="accent-[var(--shop-ink)]"
              />
              Run a time-boxed sale
            </label>

            {saleEnabled && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex gap-2">
                  {(["PERCENTAGE", "FIXED_AMOUNT"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSaleType(type)}
                      disabled={isPending}
                      className={[
                        "flex-1 rounded-lg border px-3 py-2 text-xs font-bold",
                        saleType === type
                          ? "border-[var(--shop-accent)] bg-[color-mix(in_srgb,var(--shop-accent)_10%,transparent)] text-[var(--shop-text)]"
                          : "border-[var(--shop-border)] text-[var(--shop-text-muted)]",
                      ].join(" ")}
                    >
                      {type === "PERCENTAGE" ? "% off" : "$ off"}
                    </button>
                  ))}
                </div>

                <div>
                  <label className={labelClass}>
                    {saleType === "PERCENTAGE"
                      ? "Discount percentage"
                      : "Discount amount"}
                  </label>
                  <input
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Starts</label>
                    <input
                      type="datetime-local"
                      value={saleStartsAt}
                      onChange={(e) => setSaleStartsAt(e.target.value)}
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ends</label>
                    <input
                      type="datetime-local"
                      value={saleEndsAt}
                      onChange={(e) => setSaleEndsAt(e.target.value)}
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>
                </div>

                {saleStartsAt && saleEndsAt && !saleFormValid && (
                  <p className="text-[11px] text-[var(--shop-danger)]">
                    End must be after the start.
                  </p>
                )}

                <p className="text-[11px] text-[var(--shop-text-muted)]">
                  Discounts the already marked-up price during this window. The
                  badge above always reflects these dates live, but a
                  product&apos;s displayed price only refreshes when this rule
                  is saved, applied to all, or the product is reassigned to it —
                  not automatically the instant the window starts or ends.
                </p>
              </div>
            )}
          </div>

          {isEdit && rule!.isDefault && (
            <p className="rounded-lg bg-[var(--shop-bg-soft)] px-3 py-2 text-[11px] text-[var(--shop-text-muted)]">
              This is your default rule — new products and imports use it
              automatically unless given their own rule.
            </p>
          )}

          {confirmingDelete ? (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
              <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
                Delete &quot;{rule?.name}&quot;?
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
                className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-lg bg-[var(--shop-danger)] px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 border-t border-[var(--shop-border)] pt-5">
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isPending || !canDelete}
                  title={
                    !canDelete
                      ? rule!.isDefault
                        ? "Set another rule as default first"
                        : "Reassign the products using this rule first"
                      : undefined
                  }
                  className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete rule
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isPending ||
                  !dirty ||
                  !name.trim() ||
                  markupValue.trim() === "" ||
                  !saleFormValid
                }
                className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isCreating || isUpdating
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create rule"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
