import { ImageOff as ImageOffIcon, Pencil as PencilIcon } from "lucide-react";
import type { Collection } from "../contracts/collections.contract";

type CollectionCardProps = {
  collection: Collection;
  onEdit: (collection: Collection) => void;
};

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const childCount = collection.children.length;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onEdit(collection)}
        aria-label={`Edit ${collection.title}`}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)]/90 text-[var(--shop-text-muted)] opacity-0 shadow-sm backdrop-blur transition hover:text-[var(--shop-accent)] focus-visible:opacity-100 group-hover:opacity-100"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
      <div className="relative flex h-[140px] items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--shop-ink)_6%,var(--shop-surface))]">
        {collection.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external supplier/tenant-hosted URL, not a local asset next/image can optimize
          <img
            src={collection.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-[var(--shop-text-muted)]">
            <ImageOffIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wide">
              No cover image
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="shop-display mb-1 text-[15px] font-semibold text-[var(--shop-text)]">
          {collection.title}
        </p>
        <p className="text-xs text-[var(--shop-text-muted)]">
          {childCount > 0 &&
            `${childCount} item${childCount === 1 ? "" : "s"} · `}
          {collection.isPublic ? "Live" : "Hidden"}
        </p>
      </div>
    </div>
  );
}
