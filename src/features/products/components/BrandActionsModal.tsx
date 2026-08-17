"use client";

import { useState } from "react";
import { useRenameBrand } from "../hooks/useProducts";
import type { BrandCount } from "../contracts/products.contract";
import { Modal } from "@/shared/components/Modal";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

type BrandActionsModalProps = {
  brand: BrandCount;
  onClose: () => void;
};

/**
 * Brand has no table of its own — just a `brand: string | null` column on
 * each product — so "editing"/"deleting" a brand can only mean bulk
 * rewriting that column across every product that carries it. This modal
 * is that bulk rename/clear, not a per-row edit form like
 * Category/CollectionFormModal.
 */
export function BrandActionsModal({ brand, onClose }: BrandActionsModalProps) {
  const [newName, setNewName] = useState(brand.brand);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const { mutate: rename, isPending } = useRenameBrand();

  const trimmedNewName = newName.trim();
  const dirty = trimmedNewName !== brand.brand;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedNewName || !dirty) return;
    rename(
      { brand: brand.brand, newBrand: trimmedNewName },
      { onSuccess: onClose },
    );
  };

  const handleConfirmClear = () => {
    rename({ brand: brand.brand, newBrand: null }, { onSuccess: onClose });
  };

  return (
    <Modal
      onClose={onClose}
      title="Manage brand"
      subtitle={`${brand.count} product${brand.count === 1 ? "" : "s"} currently use "${brand.brand}"`}
      maxWidthClassName="max-w-[440px]"
      footer={
        confirmingClear ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
              Clear &quot;{brand.brand}&quot; from {brand.count} product
              {brand.count === 1 ? "" : "s"}?
            </p>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              disabled={isPending}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={handleConfirmClear}
              disabled={isPending}
              className="rounded-lg bg-[var(--shop-danger)] px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Clearing…" : "Clear permanently"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              disabled={isPending}
              className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear brand
            </button>
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
              form="brand-actions-form"
              disabled={isPending || !dirty || !trimmedNewName}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        )
      }
    >
      <form id="brand-actions-form" onSubmit={handleSubmit}>
        <label className={labelClass}>Rename to</label>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isPending}
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px] text-[var(--shop-text-muted)]">
          Updates every product currently tagged &quot;{brand.brand}&quot;.
          Renaming to an existing brand merges the two.
        </p>
      </form>
    </Modal>
  );
}
