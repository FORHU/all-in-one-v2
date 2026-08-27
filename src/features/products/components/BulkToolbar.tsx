"use client";

import { useState } from "react";
import { X as XIcon } from "lucide-react";
import type { AdminProduct } from "../contracts/products.contract";
import { resolveThumbnailUrl } from "../lib/presentation";
import { useDeleteProduct, useBulkArchiveProducts } from "../hooks/useProducts";
import { notify } from "@/shared/lib/notify";
import { downloadCsv } from "@/shared/lib/csv";
import { ConfirmBar } from "@/shared/components/ConfirmBar";

type BulkToolbarProps = {
  selectedProducts: AdminProduct[];
  onClear: () => void;
  onAddToCollection: () => void;
  /** Chip rail's own remove (×) — shares the same toggle the row checkbox uses, so the two stay in sync. */
  onRemove: (productId: string) => void;
};

/** Turns a Promise.allSettled result into a "N ok / M failed" summary toast. */
function notifyBulkSummary(
  pastTenseVerb: string,
  results: PromiseSettledResult<unknown>[],
) {
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;
  if (failed === 0) {
    notify.success(
      `${pastTenseVerb} ${succeeded} product${succeeded === 1 ? "" : "s"}.`,
    );
  } else if (succeeded === 0) {
    notify.error(
      `Couldn't ${pastTenseVerb.toLowerCase()} any of ${results.length} product${results.length === 1 ? "" : "s"}.`,
    );
  } else {
    notify.error(
      `${pastTenseVerb} ${succeeded} product${succeeded === 1 ? "" : "s"}, ${failed} failed.`,
    );
  }
}

export function BulkToolbar({
  selectedProducts,
  onClear,
  onAddToCollection,
  onRemove,
}: BulkToolbarProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Own local pending flags rather than each mutation's own `isPending` —
  // both actions below fire several requests in parallel off the *same*
  // mutation object (Promise.allSettled over mutateAsync), and react-query's
  // isPending reflects only the most recently triggered call, not "is any of
  // this batch still in flight."
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const anyActionRunning = isDeleting || isArchiving || isExporting;

  const { mutateAsync: deleteProductAsync } = useDeleteProduct();
  const { mutateAsync: bulkArchiveAsync } = useBulkArchiveProducts();

  if (selectedProducts.length === 0) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const results = await bulkArchiveAsync(selectedProducts.map((p) => p.id));
      notifyBulkSummary("Archived", results);
      onClear();
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const header = ["Title", "Slug", "Status", "Price", "Stock"];
      const rows = selectedProducts.map((p) => [
        p.title,
        p.slug,
        p.status,
        p.price !== null ? p.price.toFixed(2) : "",
        p.inStock ? "In stock" : "Out of stock",
      ]);
      downloadCsv(`products-export-${Date.now()}.csv`, [header, ...rows]);
      notify.success(
        `Exported ${selectedProducts.length} product${selectedProducts.length === 1 ? "" : "s"}.`,
      );
    } catch {
      notify.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedProducts.map((p) => deleteProductAsync(p.id)),
      );
      notifyBulkSummary("Deleted", results);
      onClear();
      setConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-3 rounded-xl bg-[var(--shop-ink)] text-[var(--shop-bg)]">
      {confirmingDelete ? (
        <ConfirmBar
          size="md"
          tone="dark"
          className="px-[18px] py-2.5"
          message={
            <>
              Delete {selectedProducts.length} product
              {selectedProducts.length === 1 ? "" : "s"}? This can&apos;t be
              undone.
            </>
          }
          cancelLabel="Keep them"
          confirmLabel="Delete permanently"
          pendingLabel="Deleting…"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleConfirmDelete}
          isPending={isDeleting}
        />
      ) : (
        <div className="flex items-center justify-between px-[18px] py-2.5">
          <span className="text-sm font-semibold">
            {selectedProducts.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddToCollection}
              disabled={anyActionRunning}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to collection
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={anyActionRunning}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArchiving ? "Archiving…" : "Archive"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={anyActionRunning}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? "Exporting…" : "Export"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={anyActionRunning}
              className="rounded-full bg-[var(--shop-accent)] px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-ink)] transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear selection"
              disabled={anyActionRunning}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Chip rail — proves the selection survived filter/page changes, since it's driven by the same product objects rather than the current page's rows. */}
      <div className="flex items-center gap-2 overflow-x-auto border-t border-white/10 px-[18px] py-2.5">
        {selectedProducts.map((product) => {
          const thumbnailUrl = resolveThumbnailUrl(product.thumbnailUrl);
          return (
            <div
              key={product.id}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pl-1 pr-2"
            >
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 flex-shrink-0 rounded-full bg-white/15" />
              )}
              <span className="max-w-[90px] truncate text-[11.5px] font-semibold">
                {product.title}
              </span>
              <button
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.title} from selection`}
                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/15 hover:text-white"
              >
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
