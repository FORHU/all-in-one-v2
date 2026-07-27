import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/features/storefront/data/mock-data";
import { StarRating } from "@/features/storefront/components/StarRating";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section id="featured" className="mx-auto mt-12 max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-baseline justify-between border-b border-[var(--shop-border)] pb-3">
        <h2 className="shop-display text-2xl font-semibold uppercase tracking-[0.05em] text-[var(--shop-text)]">
          New Arrivals
        </h2>
        <span className="text-xs uppercase tracking-wide text-[var(--shop-text-muted)]">
          {products.length} pieces
        </span>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/products/${product.id}`}
            className="group flex flex-col gap-2"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[var(--shop-bg-soft)]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.compareAtPrice && (
                <span className="shop-display absolute left-2 top-2 rounded bg-[var(--shop-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  -
                  {Math.round(
                    ((product.compareAtPrice - product.price) /
                      product.compareAtPrice) *
                      100,
                  )}
                  %
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-[var(--shop-text)] group-hover:underline">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.rating} />
              <span className="text-xs text-[var(--shop-text-muted)]">
                {product.rating}/5
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--shop-text)]">
                ${product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[var(--shop-text-muted)] line-through">
                  ${product.compareAtPrice}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
