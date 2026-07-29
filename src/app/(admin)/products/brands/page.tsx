import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { BrandGrid } from "@/features/products/components/BrandGrid";

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Brands
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Manage product brands and labels.
        </p>
      </div>
      <ProductsStatsBar />
      <BrandGrid />
    </div>
  );
}
