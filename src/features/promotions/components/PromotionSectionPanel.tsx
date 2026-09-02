"use client";

import type { ReactNode } from "react";
import {
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  AlertTriangle as AlertIcon,
} from "lucide-react";

/** Shared shell for the three side-by-side editors (rules / rewards / targets). */
export function PromotionSectionPanel({
  title,
  hint,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  hint: string;
  onAdd: () => void;
  addLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-[var(--shop-border)] bg-[var(--shop-bg-soft)]/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text)]">
          {title}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold text-[var(--shop-accent-dark)] transition hover:bg-[var(--shop-accent)]/10"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
      <p className="mb-2.5 text-[10.5px] leading-snug text-[var(--shop-text-muted)]">
        {hint}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

/** One editable row with a remove button and an optional inline error. */
export function PromotionRow({
  onRemove,
  removeLabel,
  removeDisabled,
  error,
  warning,
  children,
}: {
  onRemove: () => void;
  removeLabel: string;
  removeDisabled?: boolean;
  error?: string;
  warning?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-2">
      <div className="flex items-start gap-1.5">
        <div className="min-w-0 flex-1 space-y-1.5">{children}</div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={removeLabel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] transition hover:bg-[var(--shop-danger-bg)] hover:text-[var(--shop-danger)] disabled:opacity-30"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1 text-[10.5px] font-semibold text-[var(--shop-danger)]"
        >
          <AlertIcon className="mt-px h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {warning && !error && (
        <p className="mt-1.5 flex items-start gap-1 rounded bg-[var(--shop-warning-bg)] px-1.5 py-1 text-[10.5px] font-semibold text-[var(--shop-text)]">
          <AlertIcon className="mt-px h-3 w-3 shrink-0 text-[var(--shop-warning)]" />
          {warning}
        </p>
      )}
    </div>
  );
}
