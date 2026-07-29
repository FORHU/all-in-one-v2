import { ProductsStatsBar } from "@/features/products/components/ProductsStatsBar";
import { ProductsTable } from "@/features/products/components/ProductsTable";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          All Products
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Browse and manage your full product catalog.
        </p>
      </div>
      <ProductsStatsBar />
      <ProductsTable />
    </div>
  );
}
