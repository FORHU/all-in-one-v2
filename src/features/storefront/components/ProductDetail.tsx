import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/features/storefront/data/mock-data";
import { StarRating } from "@/features/storefront/components/StarRating";
import { ShopNav } from "@/features/storefront/components/ShopNav";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="min-h-screen bg-[var(--shop-bg)]">
      <ShopNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/shop"
          className="shop-display text-xs uppercase tracking-[0.15em] text-[var(--shop-text-muted)] hover:text-[var(--shop-text)]"
        >
          ← Back to shop
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--shop-bg-soft)]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {product.compareAtPrice && (
              <span className="shop-display absolute left-3 top-3 rounded bg-[var(--shop-accent)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
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

          <div className="flex flex-col gap-4">
            <h1 className="shop-display text-3xl font-semibold uppercase tracking-tight text-[var(--shop-text)]">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[var(--shop-text-muted)]">
                {product.rating}/5 ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 [font-family:var(--font-geist-mono)]">
              <span className="text-2xl font-semibold text-[var(--shop-text)]">
                ${product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-[var(--shop-text-muted)] line-through">
                  ${product.compareAtPrice}
                </span>
              )}
            </div>

            <p className="max-w-md text-sm italic leading-relaxed text-[var(--shop-text-muted)]">
              {product.description}
            </p>

            <button
              type="button"
              className="mt-2 w-fit rounded-full bg-[var(--shop-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--shop-accent)]"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
