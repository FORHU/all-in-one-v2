import { ImageOff as ImageOffIcon } from "lucide-react";
import type { Collection } from "../contracts/collections.contract";

export function CollectionCard({ collection }: { collection: Collection }) {
  const childCount = collection.children.length;

  return (
    <div className="cursor-pointer overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
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
