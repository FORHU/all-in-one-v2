"use client";

import { X as XIcon } from "lucide-react";
import type { AdminProduct } from "../contracts/products.contract";
import { resolveThumbnailUrl } from "../lib/presentation";

type BulkToolbarProps = {
  selectedProducts: AdminProduct[];
  onClear: () => void;
  onAddToCollection: () => void;
  /** Chip rail's own remove (×) — shares the same toggle the row checkbox uses, so the two stay in sync. */
  onRemove: (productId: string) => void;
};

export function BulkToolbar({
  selectedProducts,
  onClear,
  onAddToCollection,
  onRemove,
}: BulkToolbarProps) {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="mb-3 rounded-xl bg-[var(--shop-ink)] text-[var(--shop-bg)]">
      <div className="flex items-center justify-between px-[18px] py-2.5">
        <span className="text-sm font-semibold">
          {selectedProducts.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddToCollection}
            className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10"
          >
            Add to collection
          </button>
          <button className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10">
            Archive
          </button>
          <button className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide transition hover:bg-white/10">
            Export
          </button>
          <button className="rounded-full bg-[var(--shop-accent)] px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-ink)] transition hover:brightness-90">
            Delete
          </button>
          <button
            onClick={onClear}
            aria-label="Clear selection"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

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
