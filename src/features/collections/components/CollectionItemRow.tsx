import { useEffect, useState } from "react";
import {
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  Image as ImageIcon,
  Pencil as PencilIcon,
  X as XIcon,
  ZoomIn as ZoomInIcon,
} from "lucide-react";
import type {
  CollectionItem,
  ProductVariantOption,
} from "../contracts/collections.contract";
import { useProductVariants, useProductMedia } from "../hooks/useCollections";

/** What picking one swatch sets on the item — always both fields together, so exactly one of {variant, override photo} is ever active at a time. */
export type ItemImageSelection = {
  productVariantId: string | null;
  imageUrl: string | null;
};

/** "red" + "XL" -> "red / XL"; falls back to the variant's own title if it carries neither. */
function formatVariantLabel(v: {
  color: string | null;
  size: string | null;
  title: string;
}) {
  return [v.color, v.size].filter(Boolean).join(" / ") || v.title;
}

/** "red / XL" -> "RE"; used as a swatch's fallback when the variant has no image of its own. */
function swatchInitials(v: {
  color: string | null;
  size: string | null;
  title: string;
}) {
  return (v.color ?? v.size ?? v.title).slice(0, 2).toUpperCase();
}

type VariantSwatch = {
  thumbnailUrl: string | null;
  color: string | null;
  size: string | null;
  title: string;
  /** Every variant id that shares this swatch's photo (e.g. one color across several sizes). */
  variantIds: string[];
  /** Which of those ids actually gets saved when this swatch is picked. */
  representativeId: string;
};

/**
 * Picking a variant here is really "pick the photo this item shows" — a
 * top sold in 4 colors x 5 sizes has 20 CatalogProductVariant rows but only
 * 4 distinct photos. Grouping by image (falling back to color, then the
 * variant id itself, when a variant has no photo) collapses same-photo
 * variants into one swatch instead of rendering a dozen visually-identical
 * buttons — see CollectionItemRow's original per-variant version, replaced
 * after that produced rows 3+ swatch-lines tall for high-variant-count
 * products.
 */
function groupVariantsByImage(
  variants: ProductVariantOption[],
): VariantSwatch[] {
  const groups = new Map<string, VariantSwatch>();
  for (const v of variants) {
    const key = v.thumbnailUrl ?? (v.color ? `color:${v.color}` : `id:${v.id}`);
    const existing = groups.get(key);
    if (existing) {
      existing.variantIds.push(v.id);
    } else {
      groups.set(key, {
        thumbnailUrl: v.thumbnailUrl,
        color: v.color,
        size: v.size,
        title: v.title,
        variantIds: [v.id],
        representativeId: v.id,
      });
    }
  }
  return [...groups.values()];
}

type CollectionItemRowProps = {
  item: CollectionItem;
  isFirst: boolean;
  isLast: boolean;
  removeDisabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSlotFocus: (slot: string | null) => void;
  onSlotChange: (slot: string) => void;
  onSlotBlur: (slot: string) => void;
  onOptionalToggle: (isOptional: boolean) => void;
  onImageChange: (selection: ItemImageSelection) => void;
  onSetCover: (url: string | null) => void;
  onRemove: () => void;
  /** Absent = the app layer hasn't wired product editing here — hides the edit button rather than rendering a dead one. */
  onEdit?: () => void;
};

/** One row in CollectionFormModal's item list — move/thumbnail/slot/optional/cover/remove for a single collection item. */
export function CollectionItemRow({
  item,
  isFirst,
  isLast,
  removeDisabled,
  onMoveUp,
  onMoveDown,
  onSlotFocus,
  onSlotChange,
  onSlotBlur,
  onOptionalToggle,
  onImageChange,
  onSetCover,
  onRemove,
  onEdit,
}: CollectionItemRowProps) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  useEffect(() => {
    if (!isImageZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImageZoomed(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageZoomed]);

  // Cached per productId — multiple rows for the same product (unlikely,
  // but possible with different slots) share one fetch each.
  const { data: variants } = useProductVariants(item.productId);
  const { data: media } = useProductMedia(item.productId);
  const selectedVariant =
    variants?.find((v) => v.id === item.productVariantId) ?? null;
  // Priority: an explicit photo override always wins (it was picked
  // specifically because the variant photo, if any, wasn't the right one) —
  // then the selected variant's own photo — then the product's default.
  const displayThumbnail =
    item.imageUrl ?? selectedVariant?.thumbnailUrl ?? item.product.thumbnailUrl;
  const variantSwatches = variants ? groupVariantsByImage(variants) : [];
  // Only worth offering as a picker once there's an actual color/photo
  // choice between variants — a single-color product (all variants share
  // one group) has nothing to differentiate, so its swatches come from the
  // product's own gallery instead (see galleryPhotos below).
  const showVariantSwatches = variantSwatches.length > 1;
  // The product's own gallery, minus anything already shown as the default
  // tile or a variant swatch — covers products whose photo variety lives at
  // the product level (one color, several lifestyle shots) rather than
  // per-variant, which the variant grouping above can't see at all.
  const shownUrls = new Set<string | null>(
    showVariantSwatches
      ? [
          item.product.thumbnailUrl,
          ...variantSwatches.map((s) => s.thumbnailUrl),
        ]
      : [item.product.thumbnailUrl],
  );
  const galleryPhotos = (media ?? []).filter((m) => !shownUrls.has(m.url));

  return (
    <>
      <div className="flex items-start gap-2.5 rounded-lg border border-[var(--shop-border)] px-2.5 py-2">
        <div className="flex shrink-0 flex-col pt-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move ${item.product.title} up`}
            className="flex h-3.5 w-4 items-center justify-center text-[var(--shop-text-muted)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUpIcon className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move ${item.product.title} down`}
            className="flex h-3.5 w-4 items-center justify-center text-[var(--shop-text-muted)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        </div>
        {displayThumbnail ? (
          <button
            type="button"
            onClick={() => setIsImageZoomed(true)}
            aria-label={`View image of ${item.product.title}`}
            className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize */}
            <img
              src={displayThumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomInIcon className="h-3.5 w-3.5 text-white" />
            </span>
          </button>
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-md bg-[var(--shop-bg-soft)]" />
        )}
        <div className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-[var(--shop-text)]">
            {item.product.title}
          </span>
          <div className="mt-1 flex items-center gap-2.5">
            <input
              value={item.slot ?? ""}
              onFocus={() => onSlotFocus(item.slot)}
              onChange={(e) => onSlotChange(e.target.value)}
              onBlur={(e) => onSlotBlur(e.target.value)}
              placeholder="Slot (e.g. Top, Shoes)"
              className="w-32 rounded border border-[var(--shop-border)] bg-[var(--shop-surface)] px-1.5 py-0.5 text-[10.5px] text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
            />
            <label className="flex items-center gap-1 text-[10.5px] font-medium text-[var(--shop-text-muted)]">
              <input
                type="checkbox"
                checked={item.isOptional}
                onChange={(e) => onOptionalToggle(e.target.checked)}
                className="h-3 w-3 accent-[var(--shop-ink)]"
              />
              Optional
            </label>
          </div>
          {/* One row per item, always, once its photo sources have loaded —
              a row with nothing here (vs. a neighbor showing a full strip)
              read as a missing/broken image rather than "this product only
              has one option." The leading tile is always the current
              picture; variant swatches only render when variants actually
              differ (color), and gallery photos fill in the common case
              where a single-color product's photo variety lives in its own
              gallery instead (see galleryPhotos above — this is exactly
              what a 6-variant, one-color, five-photo product needs).
              Capped to one row + horizontal scroll instead of wrapping, so
              a high-variant-count product doesn't blow the row height out —
              every row stays the same height regardless of count. */}
          {((variants && variants.length > 0) ||
            (media && media.length > 0)) && (
            <div className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() =>
                  onImageChange({ productVariantId: null, imageUrl: null })
                }
                title="Product default"
                aria-label={`Use ${item.product.title}'s default photo`}
                aria-pressed={
                  item.productVariantId === null && item.imageUrl === null
                }
                className={`h-6 w-6 shrink-0 overflow-hidden rounded border ${
                  item.productVariantId === null && item.imageUrl === null
                    ? "border-[var(--shop-accent)] ring-1 ring-[var(--shop-accent)]"
                    : "border-[var(--shop-border)] hover:border-[var(--shop-accent)]"
                }`}
              >
                {item.product.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                  <img
                    src={item.product.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--shop-bg-soft)] text-[8px] font-bold text-[var(--shop-text-muted)]">
                    —
                  </div>
                )}
              </button>
              {showVariantSwatches &&
                variantSwatches.map((s) => {
                  const isSelected =
                    item.imageUrl === null &&
                    item.productVariantId !== null &&
                    s.variantIds.includes(item.productVariantId);
                  // A supplier sometimes ships a color with no photo of its
                  // own (Printful/CJ variant with an empty images[]) — fall
                  // back to the product's imported photo rather than a bare
                  // placeholder box. Dimmed slightly so it reads as "no photo
                  // for this one specifically" rather than a real match.
                  const hasOwnPhoto = Boolean(s.thumbnailUrl);
                  const swatchImage =
                    s.thumbnailUrl ?? item.product.thumbnailUrl;
                  return (
                    <button
                      key={s.representativeId}
                      type="button"
                      onClick={() =>
                        onImageChange({
                          productVariantId: s.representativeId,
                          imageUrl: null,
                        })
                      }
                      title={s.color ?? formatVariantLabel(s)}
                      aria-label={`Use ${s.color ?? formatVariantLabel(s)} variant`}
                      aria-pressed={isSelected}
                      className={`h-6 w-6 shrink-0 overflow-hidden rounded border ${
                        isSelected
                          ? "border-[var(--shop-accent)] ring-1 ring-[var(--shop-accent)]"
                          : "border-[var(--shop-border)] hover:border-[var(--shop-accent)]"
                      }`}
                    >
                      {swatchImage ? (
                        // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                        <img
                          src={swatchImage}
                          alt=""
                          className={`h-full w-full object-cover ${hasOwnPhoto ? "" : "opacity-60"}`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--shop-bg-soft)] text-[8px] font-bold text-[var(--shop-text-muted)]">
                          {swatchInitials(s)}
                        </div>
                      )}
                    </button>
                  );
                })}
              {galleryPhotos.map((m) => {
                const isSelected = item.imageUrl === m.url;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      onImageChange({ productVariantId: null, imageUrl: m.url })
                    }
                    title="Product photo"
                    aria-label={`Use this photo for ${item.product.title}`}
                    aria-pressed={isSelected}
                    className={`h-6 w-6 shrink-0 overflow-hidden rounded border ${
                      isSelected
                        ? "border-[var(--shop-accent)] ring-1 ring-[var(--shop-accent)]"
                        : "border-[var(--shop-border)] hover:border-[var(--shop-accent)]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize */}
                    <img
                      src={m.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {displayThumbnail && (
          <button
            type="button"
            onClick={() => onSetCover(displayThumbnail)}
            aria-label={`Use ${item.product.title}'s image as the cover`}
            title="Use as cover image"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-text)]"
          >
            <ImageIcon className="h-3 w-3" />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${item.product.title}`}
            title="Edit product details"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-text)]"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`Remove ${item.product.title}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-danger-bg)] hover:text-[var(--shop-danger)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>

      {isImageZoomed && displayThumbnail && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-8"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageZoomed(false)}
            aria-label="Close zoomed image"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize */}
          <img
            src={displayThumbnail}
            alt={item.product.title}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
