"use client";

import { useState } from "react";
import {
  useCreatePricingRule,
  useUpdatePricingRule,
  useDeletePricingRule,
  useApplyPricingRuleToAll,
} from "../hooks/usePricingRules";
import type { PricingRule } from "../contracts/pricing-rules.contract";
import type {
  PricingRuleWriteInput,
  PricingRuleSaleWriteInput,
} from "../api/pricing-rules.client";
import { Modal } from "@/shared/components/Modal";
import { ConfirmBar } from "@/shared/components/ConfirmBar";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

type PricingRuleFormModalProps = {
  /** Present = edit mode (seeded from this row). Absent = create mode. */
  rule?: PricingRule;
  onClose: () => void;
};

/**
 * Only ever called on text `isBlankOrValidNumber` has already accepted —
 * submission is blocked while Minimum profit holds unparseable text, so this
 * never has to silently coerce garbage to null.
 */
function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  return Number(value);
}

/**
 * True when a numeric field is blank (cleared, valid) or parses to a real
 * finite number — false for typed-but-unparseable text like "abc", which
 * `parseOptionalNumber` alone can't distinguish from an intentional clear
 * (both used to silently become `null`). Gates submission and the inline
 * error below the field.
 */
function isBlankOrValidNumber(value: string): boolean {
  if (value.trim() === "") return true;
  return Number.isFinite(Number(value));
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
  // Folds the grid's separate "Set as default & apply to all" button into
  // this same Save action — that used to be a second step an admin had to
  // remember to go back and do after creating/editing a rule, which is
  // exactly why new imports kept missing the markup they just set up.
  // Unchecked by default: it's still an explicit, deliberate choice (it
  // reassigns every eligible product onto this rule), just no longer a
  // separate screen to remember.
  const [applyAsDefault, setApplyAsDefault] = useState(false);

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => {
      mapped[k] = v[0] ?? "Invalid";
    });
    setErrors(mapped);
  };

  const { mutateAsync: create, isPending: isCreating } = useCreatePricingRule({
    onValidationError,
  });
  const { mutateAsync: update, isPending: isUpdating } = useUpdatePricingRule(
    rule?.id ?? "",
    { onValidationError },
  );
  const { mutate: remove, isPending: isDeleting } = useDeletePricingRule();
  const { mutateAsync: applyToAll, isPending: isApplying } =
    useApplyPricingRuleToAll();

  const isPending = isCreating || isUpdating || isDeleting || isApplying;

  const minimumProfitValid = isBlankOrValidNumber(minimumProfit);

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
    applyAsDefault ||
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minimumProfitValid) return;
    setErrors({});
    try {
      const saved = isEdit
        ? await update(buildInput())
        : await create(buildInput());
      if (applyAsDefault && !saved.isDefault) {
        await applyToAll(saved.id);
      }
      onClose();
    } catch {
      // Left open on failure — the mutation's own error toast (or the
      // onValidationError-mapped inline errors above) already explains why.
    }
  };

  const canDelete = isEdit && !rule!.isDefault && rule!.productCount === 0;

  const handleConfirmDelete = () => {
    if (!rule) return;
    remove(rule.id, { onSuccess: onClose });
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit pricing rule" : "New pricing rule"}
      subtitle={isEdit ? rule?.name : undefined}
      maxWidthClassName="max-w-[440px]"
      footer={
        confirmingDelete ? (
          <ConfirmBar
            className="rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4"
            message={<>Delete &quot;{rule?.name}&quot;?</>}
            cancelLabel="Keep it"
            confirmLabel="Delete permanently"
            pendingLabel="Deleting…"
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={handleConfirmDelete}
            isPending={isPending}
          />
        ) : (
          <div className="flex items-center gap-2.5">
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
              form="pricing-rule-form"
              disabled={
                isPending ||
                !dirty ||
                !name.trim() ||
                markupValue.trim() === "" ||
                !saleFormValid ||
                !minimumProfitValid
              }
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCreating || isUpdating
                ? "Saving…"
                : isApplying
                  ? "Applying…"
                  : isEdit
                    ? "Save changes"
                    : "Create rule"}
            </button>
          </div>
        )
      }
    >
      <form
        id="pricing-rule-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
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
            Floor on profit per unit — the price is bumped up if the percentage
            alone would leave less than this.
          </p>
          {!minimumProfitValid && (
            <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
              Enter a valid number.
            </p>
          )}
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
                product&apos;s displayed price only refreshes when this rule is
                saved, applied to all, or the product is reassigned to it — not
                automatically the instant the window starts or ends.
              </p>
            </div>
          )}
        </div>

        {isEdit && rule!.isDefault ? (
          <p className="rounded-lg bg-[var(--shop-bg-soft)] px-3 py-2 text-[11px] text-[var(--shop-text-muted)]">
            This is your default rule — new products and imports use it
            automatically unless given their own rule.
          </p>
        ) : (
          <label className="flex items-start gap-2.5 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-3 py-2.5">
            <input
              type="checkbox"
              checked={applyAsDefault}
              onChange={(e) => setApplyAsDefault(e.target.checked)}
              disabled={isPending}
              className="mt-0.5 accent-[var(--shop-ink)]"
            />
            <span>
              <span className="block text-[11px] font-bold text-[var(--shop-text)]">
                Set as default &amp; apply to all
              </span>
              <span className="mt-0.5 block text-[10.5px] text-[var(--shop-text-muted)]">
                Makes this the rule new imports pick up automatically, and
                immediately reprices every eligible product onto it.
              </span>
            </span>
          </label>
        )}
      </form>
    </Modal>
  );
}
