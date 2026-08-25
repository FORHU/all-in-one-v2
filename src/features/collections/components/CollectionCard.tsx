import { Image as ImageIcon, Pencil as PencilIcon } from "lucide-react";
import type {
  Collection,
  CollectionType,
} from "../contracts/collections.contract";
import { modeForType, type CollectionMode } from "./collection-mode";

type CollectionCardProps = {
  collection: Collection;
  onEdit: (collection: Collection) => void;
};

/** "ALL_SEASON" -> "All-season" */
function formatSeason(season: string): string {
  return season.charAt(0) + season.slice(1).toLowerCase().replace("_", "-");
}

/** "ROOM_BUNDLE" -> "Room bundle" */
function formatType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ");
}

const MODE_BADGE_STYLE: Record<CollectionMode, string> = {
  // Distinguished by color, not just text, so the two read apart at a
  // glance in a dense grid — outfit = accent (the "combination of pieces"
  // case this whole feature is built around), collection = neutral ink.
  outfit: "bg-[color-mix(in_srgb,var(--shop-accent)_88%,black)] text-white",
  collection: "bg-[var(--shop-ink)]/85 text-white",
};

// How many item photos the filmstrip shows before collapsing the rest into
// a "+N" tile — matches the leading swatch + a handful pattern used
// elsewhere in this feature (CollectionItemRow's variant picker).
const FILMSTRIP_MAX = 5;

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const itemCount = collection.items.length;
  const season =
    typeof collection.metadata?.season === "string"
      ? collection.metadata.season
      : null;
  const mode = modeForType(collection.type as CollectionType);
  const filmstripItems = collection.items.slice(0, FILMSTRIP_MAX);
  const filmstripOverflow = collection.items.length - filmstripItems.length;

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
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur ${MODE_BADGE_STYLE[mode]}`}
        >
          {formatType(collection.type)}
        </span>
        {season && (
          <span className="rounded-full bg-[var(--shop-surface)]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-text)] shadow-sm backdrop-blur">
            {formatSeason(season)}
          </span>
        )}
      </div>
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
          <div className="flex flex-col items-center gap-2 text-[var(--shop-text-muted)]">
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">No cover image</span>
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

        {/* What's actually in the look, not just its cover photo — the
            single hero image above doesn't show the pieces that make up an
            outfit/bundle. */}
        {filmstripItems.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1">
            {filmstripItems.map((item) => (
              <div
                key={item.id}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[var(--shop-border)] bg-[var(--shop-bg-soft)]"
                title={item.product.title}
              >
                {item.product.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                  <img
                    src={item.product.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
            {filmstripOverflow > 0 && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] text-[10px] font-bold text-[var(--shop-text-muted)]">
                +{filmstripOverflow}
              </div>
            )}
          </div>
        )}

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
