import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { CategoryGrid } from "@/features/products/components/CategoryGrid";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Categories
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Organize products into categories.
        </p>
      </div>
      <ProductsStatsBar />
      <CategoryGrid />
    </div>
  );
}
