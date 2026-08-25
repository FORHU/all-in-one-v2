import { ImageOff as ImageOffIcon, Pencil as PencilIcon } from "lucide-react";
import type { Collection } from "../contracts/collections.contract";

type CollectionCardProps = {
  collection: Collection;
  onEdit: (collection: Collection) => void;
};

/** "ALL_SEASON" -> "All-season" */
function formatSeason(season: string): string {
  return season.charAt(0) + season.slice(1).toLowerCase().replace("_", "-");
}

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const itemCount = collection.items.length;
  const season =
    typeof collection.metadata?.season === "string"
      ? collection.metadata.season
      : null;

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
      {season && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--shop-surface)]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-text)] shadow-sm backdrop-blur">
          {formatSeason(season)}
        </span>
      )}
      <div className="relative flex h-[240px] items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--shop-ink)_6%,var(--shop-surface))]">
        {collection.imageUrl ? (
          // Anchored to the top (not centered) — fashion photos are shot
          // portrait, so centering a tall image into this frame crops off
          // the model's head/shoulders. `object-top` keeps that intact even
          // when the source image is a different aspect ratio than the frame.
          // eslint-disable-next-line @next/next/no-img-element -- external supplier/tenant-hosted URL, not a local asset next/image can optimize
          <img
            src={collection.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
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
          {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
          {collection.isPublic ? "Live" : "Hidden"}
        </p>

        {collection.children.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {collection.children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(child);
                }}
                className="rounded-full border border-[var(--shop-border)] px-2 py-1 text-[10px] font-semibold text-[var(--shop-text-muted)] hover:border-[var(--shop-accent)] hover:text-[var(--shop-accent)]"
              >
                {child.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
