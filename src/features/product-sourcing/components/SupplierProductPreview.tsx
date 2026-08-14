"use client";

import { useEffect, useState } from "react";
import {
  X as XIcon,
  Loader2 as Loader2Icon,
  AlertTriangle as AlertTriangleIcon,
  ZoomIn as ZoomInIcon,
  CircleCheck as CircleCheckIcon,
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

function priceRangeLabel(detail: SupplierProductDetail): string {
  const variantPrices = (detail.variants ?? [])
    .map((v) => v.variantSellPrice)
    .filter((p): p is number => p !== undefined);
  if (variantPrices.length === 0) return formatPrice(detail.sellPrice);

  const min = Math.min(...variantPrices);
  const max = Math.max(...variantPrices);
  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function SupplierProductPreview({
  externalId,
  detail,
  isLoading,
  isError,
  onClose,
  onImport,
  isImporting,
}: SupplierProductPreviewProps) {
  const images = detail
    ? Array.from(
        new Set(
          [detail.bigImage, ...(detail.productImageSet ?? [])].filter(
            (src): src is string => Boolean(src),
          ),
        ),
      )
    : [];
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Jump back to the first image and close any open zoom whenever a
  // different product is previewed.
  useEffect(() => {
    setActiveImage(0);
    setIsZoomed(false);
  }, [externalId]);

  useEffect(() => {
    if (!isZoomed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomed(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isZoomed]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-xl bg-[var(--shop-surface)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            Preview — {externalId}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
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
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-64">
              {images.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  aria-label="Zoom image"
                  className="group relative aspect-square w-full overflow-hidden rounded-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize */}
                  <img
                    src={images[activeImage]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <ZoomInIcon className="h-6 w-6 text-white" />
                  </span>
                </button>
              ) : (
                <div className="aspect-square w-full rounded-lg bg-[var(--shop-bg-soft)]" />
              )}
              {images.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1}`}
                      aria-current={index === activeImage}
                      className="h-12 w-12 shrink-0 overflow-hidden rounded border"
                      style={{
                        borderColor:
                          index === activeImage
                            ? "var(--shop-accent-dark)"
                            : "transparent",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-base font-bold text-[var(--shop-text)]">
                {detail.productNameEn || "Untitled product"}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--shop-text-muted)]">
                <span className="text-sm font-bold text-[var(--shop-text)]">
                  {priceRangeLabel(detail)}
                </span>
                {detail.productSku && <span>SKU {detail.productSku}</span>}
                {detail.productWeight && <span>{detail.productWeight}g</span>}
              </div>

              {detail.categoryName && (
                <p className="text-xs text-[var(--shop-text-muted)]">
                  {detail.categoryName}
                </p>
              )}

              {detail.description && (
                // CJ's description is raw HTML — rendered as plain text (not
                // dangerouslySetInnerHTML) since it's untrusted supplier content.
                <p className="max-h-24 overflow-y-auto text-xs text-[var(--shop-text-muted)]">
                  {stripHtml(detail.description)}
                </p>
              )}

              {detail.variants && detail.variants.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
                    Variants ({detail.variants.length})
                  </p>
                  <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                    {detail.variants.map((variant) => (
                      <div
                        key={variant.vid}
                        className="flex items-center gap-2 rounded-md border border-[var(--shop-border)] p-1.5"
                      >
                        {variant.variantImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize
                          <img
                            src={variant.variantImage}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 shrink-0 rounded bg-[var(--shop-bg-soft)]" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-[var(--shop-text)]">
                            {variant.variantKey ||
                              variant.variantNameEn ||
                              "Variant"}
                          </p>
                          <p className="text-[11px] text-[var(--shop-text-muted)]">
                            {formatPrice(variant.variantSellPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.alreadyImported ? (
                <div
                  className="mt-2 flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--shop-success)",
                    backgroundColor: "var(--shop-success-bg)",
                  }}
                >
                  <CircleCheckIcon className="h-4 w-4" />
                  Already in your catalog
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onImport}
                  disabled={isImporting}
                  className="mt-2 w-fit rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--shop-accent-dark)" }}
                >
                  {isImporting ? "Importing…" : "Import to catalog"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isZoomed && images.length > 0 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-8"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoomed image"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- external supplier-hosted image, not a local asset next/image can optimize */}
          <img
            src={images[activeImage]}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
