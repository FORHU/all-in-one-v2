import {
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  Image as ImageIcon,
  X as XIcon,
} from "lucide-react";
import type { CollectionItem } from "../contracts/collections.contract";

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
  onSetCover: (url: string | null) => void;
  onRemove: () => void;
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
  onSetCover,
  onRemove,
}: CollectionItemRowProps) {
  return (
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
      {item.product.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
        <img
          src={item.product.thumbnailUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-md object-cover"
        />
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
      </div>
      {item.product.thumbnailUrl && (
        <button
          type="button"
          onClick={() => onSetCover(item.product.thumbnailUrl)}
          aria-label={`Use ${item.product.title}'s image as the cover`}
          title="Use as cover image"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-text)]"
        >
          <ImageIcon className="h-3 w-3" />
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
  );
}
