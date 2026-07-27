import Image from "next/image";
import type { GalleryImage } from "@/features/storefront/data/mock-data";

export function GalleryStrip({ images }: { images: GalleryImage[] }) {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-6">
      <div className="mb-6 flex items-baseline justify-between border-b border-[var(--shop-border)] pb-3">
        <h2 className="shop-display text-2xl font-semibold uppercase tracking-[0.05em] text-[var(--shop-text)]">
          The Look Book
        </h2>
        <span className="text-xs uppercase tracking-wide text-[var(--shop-text-muted)]">
          {images.length} plates
        </span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {images.map((image, i) => (
          <div
            key={image.id}
            className="flex flex-shrink-0 snap-start flex-col gap-1.5"
          >
            <div className="relative h-48 w-36 overflow-hidden rounded-lg bg-[var(--shop-bg-soft)] sm:h-56 sm:w-40">
              <Image
                src={image.imageUrl}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </div>
            <span className="shop-display text-[10px] tracking-[0.15em] text-[var(--shop-text-muted)]">
              Pl. {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
