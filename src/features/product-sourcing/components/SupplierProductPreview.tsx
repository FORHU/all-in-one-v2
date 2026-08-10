"use client";

import {
  X as XIcon,
  Loader2 as Loader2Icon,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";
import type { SupplierProductDetail } from "../contracts/product-sourcing.contract";
import { formatPrice, stripHtml } from "../lib/presentation";

type SupplierProductPreviewProps = {
  externalId: string;
  detail: SupplierProductDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onImport: () => void;
  isImporting: boolean;
};

export function SupplierProductPreview({
  externalId,
  detail,
  isLoading,
  isError,
  onClose,
  onImport,
  isImporting,
}: SupplierProductPreviewProps) {
  return (
    <div className="mb-5 rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Preview — {externalId}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--shop-text-muted)]">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          Loading product detail…
        </div>
      ) : isError || !detail ? (
        <div
          role="alert"
          className="flex items-center gap-2 py-8 text-sm"
          style={{ color: "var(--shop-danger)" }}
        >
          <AlertTriangleIcon className="h-4 w-4" />
          Couldn&apos;t load this product from the supplier.
        </div>
      ) : (
        <div className="flex gap-5">
          {detail.bigImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize
            <img
              src={detail.bigImage}
              alt=""
              className="h-32 w-32 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-32 w-32 shrink-0 rounded-lg bg-[var(--shop-bg-soft)]" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm font-bold text-[var(--shop-text)]">
              {detail.productNameEn || "Untitled product"}
            </p>
            {detail.description && (
              // CJ's description is raw HTML — rendered as plain text (not
              // dangerouslySetInnerHTML) since it's untrusted supplier content.
              <p className="line-clamp-3 text-xs text-[var(--shop-text-muted)]">
                {stripHtml(detail.description)}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-[var(--shop-text-muted)]">
              <span>{formatPrice(detail.sellPrice)}</span>
              {detail.productSku && <span>SKU {detail.productSku}</span>}
              {detail.categoryName && <span>{detail.categoryName}</span>}
            </div>
            <button
              type="button"
              onClick={onImport}
              disabled={isImporting}
              className="mt-2 w-fit rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              {isImporting ? "Importing…" : "Import to catalog"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
