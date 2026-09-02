"use client";

import { useState } from "react";
import { AlertTriangle as AlertIcon } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Dropdown } from "@/shared/components/Dropdown";
import { DateTimeField } from "@/shared/components/DateTimeField";
import { notify } from "@/shared/lib/notify";
import {
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from "../hooks/usePromotions";
import type { Promotion } from "../contracts/promotions.contract";
import { PromotionRulesEditor } from "./PromotionRulesEditor";
import { PromotionRewardsEditor } from "./PromotionRewardsEditor";
import { PromotionTargetsEditor } from "./PromotionTargetsEditor";
import {
  STATUS_OPTIONS,
  inputClass,
  labelClass,
  hintClass,
  fieldErrorClass,
  seedDraft,
  draftSignature,
  validateDraft,
  type IdentityDraft,
  type PromotionDraft,
} from "./promotion-form-model";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={fieldErrorClass}>
      <AlertIcon className="mt-px h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

type PromotionFormModalProps = {
  /** Present = edit mode. Absent = create mode. */
  promotion?: Promotion;
  onClose: () => void;
};

export function PromotionFormModal({
  promotion,
  onClose,
}: PromotionFormModalProps) {
  const isEdit = Boolean(promotion);

  const [draft, setDraft] = useState<PromotionDraft>(() =>
    seedDraft(promotion),
  );
  const [initialSignature] = useState(() =>
    draftSignature(seedDraft(promotion)),
  );
  const dirty = draftSignature(draft) !== initialSignature;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const patchIdentity = (next: Partial<IdentityDraft>) =>
    setDraft((d) => ({ ...d, identity: { ...d.identity, ...next } }));

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => (mapped[k] = v[0] ?? "Invalid"));
    setServerErrors(mapped);
    setSummary("The server rejected some values — see the highlighted fields.");
  };

  const { mutate: create, isPending: isCreating } = useCreatePromotion({
    onValidationError,
  });
  const { mutate: update, isPending: isUpdating } = useUpdatePromotion(
    promotion?.id ?? "",
    {
      onValidationError,
    },
  );
  const { mutate: remove, isPending: isDeleting } = useDeletePromotion();
  const isPending = isCreating || isUpdating || isDeleting;

  const err = (key: string) => fieldErrors[key] ?? serverErrors[key];

  // Closing a form with edits routes through an in-modal confirm banner
  // (matching the delete-confirm pattern) rather than a native dialog.
  const requestClose = () => {
    if (dirty) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  };

  const discardAndClose = () => {
    // notify.success (not .info) to match the app's other "done" toasts —
    // sonner's info variant renders blue, which is off-palette here.
    notify.success("Discarded unsaved changes.");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    const { input, fieldErrors: fe, rowErrors: re } = validateDraft(draft);
    setFieldErrors(fe);
    setRowErrors(re);
    if (!input) {
      setSummary("Some fields need attention before this can be saved.");
      return;
    }
    setSummary(null);
    const done = { onSuccess: onClose };
    if (isEdit) update(input, done);
    else create(input, done);
  };

  const id = draft.identity;

  return (
    <Modal
      onClose={requestClose}
      title={isEdit ? "Edit promotion" : "New promotion"}
      subtitle={isEdit ? promotion?.title : undefined}
      maxWidthClassName="max-w-[980px]"
      footer={
        confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
              Delete &quot;{promotion?.title}&quot;? This can&apos;t be undone.
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
              onClick={() =>
                promotion && remove(promotion.id, { onSuccess: onClose })
              }
              disabled={isPending}
              className="rounded-lg bg-[var(--shop-danger)] px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-90 disabled:opacity-40"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        ) : confirmingDiscard ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-text)]">
              You have unsaved changes.{" "}
              {isEdit ? "Discard them?" : "Discard this new promotion?"}
            </p>
            <button
              type="button"
              onClick={() => setConfirmingDiscard(false)}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={discardAndClose}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)]"
            >
              Discard changes
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {isEdit && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={isPending}
                className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:opacity-40"
              >
                Delete
              </button>
            )}
            <div className="min-w-0 flex-1">
              {summary && (
                <p
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--shop-danger)]"
                >
                  <AlertIcon className="h-3.5 w-3.5 shrink-0" />
                  {summary}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={requestClose}
              disabled={isPending}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="promotion-form"
              disabled={isPending || !id.title.trim() || (isEdit && !dirty)}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:opacity-40"
            >
              {isCreating || isUpdating
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create promotion"}
            </button>
          </div>
        )
      }
    >
      <form id="promotion-form" onSubmit={handleSubmit} noValidate>
        {/* Identity + schedule — one responsive band, no vertical stacking on desktop */}
        <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="promo-title">
              Title
            </label>
            <input
              id="promo-title"
              value={id.title}
              maxLength={200}
              onChange={(e) => patchIdentity({ title: e.target.value })}
              placeholder="e.g. Spring footwear sale"
              disabled={isPending}
              className={inputClass}
              aria-invalid={Boolean(err("title"))}
            />
            <FieldError message={err("title")} />
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-code">
              Code
            </label>
            <input
              id="promo-code"
              value={id.code}
              maxLength={60}
              onChange={(e) => patchIdentity({ code: e.target.value })}
              placeholder="SUMMER20"
              disabled={isPending}
              className={inputClass}
              aria-invalid={Boolean(err("code"))}
            />
            <p className={hintClass}>Blank = applies automatically.</p>
            <FieldError message={err("code")} />
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-status">
              Status
            </label>
            <Dropdown
              value={id.status}
              options={STATUS_OPTIONS}
              disabled={isPending}
              aria-label="Status"
              onChange={(v) => patchIdentity({ status: v })}
            />
            <p className={hintClass}>Only Active promotions apply.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-starts">
              Starts
            </label>
            <DateTimeField
              id="promo-starts"
              value={id.startDate}
              onChange={(v) => patchIdentity({ startDate: v })}
              max={id.endDate || undefined}
              disabled={isPending}
              placeholder="Immediately"
              aria-label="Promotion start date and time"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-ends">
              Ends
            </label>
            <DateTimeField
              id="promo-ends"
              value={id.endDate}
              onChange={(v) => patchIdentity({ endDate: v })}
              min={id.startDate || undefined}
              disabled={isPending}
              placeholder="No end date"
              aria-label="Promotion end date and time"
            />
            <FieldError message={err("endDate")} />
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-priority">
              Priority
            </label>
            <input
              id="promo-priority"
              value={id.priority}
              onChange={(e) => patchIdentity({ priority: e.target.value })}
              inputMode="numeric"
              disabled={isPending}
              className={inputClass}
              aria-invalid={Boolean(err("priority"))}
            />
            <p className={hintClass}>Higher wins when promos stack.</p>
            <FieldError message={err("priority")} />
          </div>

          <div>
            <label className={labelClass} htmlFor="promo-usage">
              Usage limit
            </label>
            <input
              id="promo-usage"
              value={id.usageLimit}
              onChange={(e) => patchIdentity({ usageLimit: e.target.value })}
              inputMode="numeric"
              placeholder="Unlimited"
              disabled={isPending}
              className={inputClass}
              aria-invalid={Boolean(err("usageLimit"))}
            />
            {isEdit && (
              <p className={hintClass}>
                Used {promotion?.usageCount ?? 0}× so far.
              </p>
            )}
            <FieldError message={err("usageLimit")} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelClass} htmlFor="promo-description">
              Description
            </label>
            <textarea
              id="promo-description"
              value={id.description}
              maxLength={2000}
              onChange={(e) => patchIdentity({ description: e.target.value })}
              rows={2}
              disabled={isPending}
              placeholder="Internal note — what this campaign is for."
              className={inputClass}
            />
            <FieldError message={err("description")} />
          </div>
        </div>

        {/* Three editors side-by-side on desktop, stacked on narrow screens */}
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <PromotionRulesEditor
            rows={draft.rules}
            errors={rowErrors}
            disabled={isPending}
            onChange={(rules) => setDraft((d) => ({ ...d, rules }))}
          />
          <div>
            <PromotionRewardsEditor
              rows={draft.rewards}
              errors={rowErrors}
              disabled={isPending}
              onChange={(rewards) => setDraft((d) => ({ ...d, rewards }))}
            />
            <FieldError message={err("rewards")} />
          </div>
          <PromotionTargetsEditor
            rows={draft.targets}
            errors={rowErrors}
            disabled={isPending}
            onChange={(targets) => setDraft((d) => ({ ...d, targets }))}
          />
        </div>
      </form>
    </Modal>
  );
}
