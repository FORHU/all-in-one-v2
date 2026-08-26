"use client";

import type { ReactNode } from "react";

type ConfirmBarSize = "lg" | "md" | "sm";

type ConfirmBarProps = {
  /** What's about to happen — phrase as a question/warning, not a label. */
  message: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  /** Shown on the confirm button instead of confirmLabel while isPending. */
  pendingLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  /** "success" for a reversing action (e.g. reactivating something) — everything else in this app that uses this bar is a "danger" action. */
  variant?: "danger" | "success";
  /**
   * "lg" — modal footer card (this app's original convention: BrandActionsModal,
   * CollectionFormModal, CategoryFormModal, ProductFormModal, PricingRuleFormModal,
   * StaffAccountModal). "md" — pill-shaped, sized for a toolbar (BulkToolbar).
   * "sm" — compact, stacked message-then-buttons, sized for a row's popover menu
   * (TenantRow).
   */
  size?: ConfirmBarSize;
  /** Sits on a dark background (e.g. the products bulk toolbar) — swaps the cancel button for a light-on-dark scheme instead of the default light-surface one. */
  tone?: "light" | "dark";
  /** Outer wrapper override — e.g. the bordered/tinted card the "lg" modal-footer callers render this inside. */
  className?: string;
};

const SIZE_STYLES: Record<
  ConfirmBarSize,
  { wrapper: string; message: string; button: string; stacked: boolean }
> = {
  lg: {
    wrapper: "flex items-center gap-3",
    message: "flex-1 text-[13px] font-semibold",
    button: "rounded-lg px-4 py-2.5 text-[13px] font-bold",
    stacked: false,
  },
  md: {
    wrapper: "flex items-center gap-3",
    message: "flex-1 text-[12.5px] font-semibold",
    button:
      "rounded-full px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition",
    stacked: false,
  },
  sm: {
    wrapper: "flex flex-col gap-2",
    message: "text-[11.5px] font-semibold",
    button: "flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition",
    stacked: true,
  },
};

/**
 * Confirm-before-you-fire banner: a warning message that swaps in for the
 * normal action row, with Cancel/Confirm buttons, before a destructive (or
 * reversing) mutation actually runs. Previously hand-rolled independently in
 * every modal that needed one — this is that markup, parameterized for the
 * three contexts it's used in across the app (a modal footer, a dark
 * toolbar, a row's compact popover menu) instead of copy-pasted per caller.
 */
export function ConfirmBar({
  message,
  cancelLabel = "Cancel",
  confirmLabel,
  pendingLabel,
  onCancel,
  onConfirm,
  isPending = false,
  variant = "danger",
  size = "lg",
  tone = "light",
  className,
}: ConfirmBarProps) {
  const s = SIZE_STYLES[size];
  const confirmColor =
    variant === "danger" ? "var(--shop-danger)" : "var(--shop-success)";
  const messageColor =
    variant === "danger" ? "var(--shop-danger)" : "var(--shop-text)";

  const cancelClass =
    tone === "dark"
      ? `${s.button} border border-white/20 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40`
      : `${s.button} border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40`;

  const confirmClass = `${s.button} text-white hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40`;

  const cancelButton = (
    <button
      type="button"
      onClick={onCancel}
      disabled={isPending}
      className={cancelClass}
    >
      {cancelLabel}
    </button>
  );

  const confirmButton = (
    <button
      type="button"
      onClick={onConfirm}
      disabled={isPending}
      style={{ backgroundColor: confirmColor }}
      className={confirmClass}
    >
      {isPending ? pendingLabel : confirmLabel}
    </button>
  );

  const messageEl = (
    <p className={s.message} style={{ color: messageColor }}>
      {message}
    </p>
  );

  const wrapperClass = [s.wrapper, className].filter(Boolean).join(" ");

  if (s.stacked) {
    return (
      <div className={wrapperClass}>
        {messageEl}
        <div className="flex gap-1.5">
          {cancelButton}
          {confirmButton}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {messageEl}
      {cancelButton}
      {confirmButton}
    </div>
  );
}
