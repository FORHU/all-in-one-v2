"use client";

import { useState } from "react";
import { X as XIcon } from "lucide-react";
import { useRenameBrand } from "../hooks/useProducts";
import type { BrandCount } from "../contracts/products.contract";

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shop-ink)]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] overflow-auto rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--shop-border)] p-6">
          <div>
            <p className="shop-display text-[17px] font-semibold text-[var(--shop-text)]">
              Manage brand
            </p>
            <p className="mt-0.5 text-xs text-[var(--shop-text-muted)]">
              {brand.count} product{brand.count === 1 ? "" : "s"} currently use
              &quot;{brand.brand}&quot;.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--shop-bg)] text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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

          {confirmingClear ? (
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
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
            <div className="mt-5 flex items-center gap-2.5 border-t border-[var(--shop-border)] pt-5">
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
                disabled={isPending || !dirty || !trimmedNewName}
                className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
