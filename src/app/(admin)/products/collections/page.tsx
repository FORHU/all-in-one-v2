import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { CollectionGrid } from "@/features/collections/components/CollectionGrid";

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Collections
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Group products into curated collections.
        </p>
      </div>
      <ProductsStatsBar />
      <CollectionGrid />
    </div>
  );
}
