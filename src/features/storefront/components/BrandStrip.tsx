import type { Brand } from "@/features/storefront/data/mock-data";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <section className="mt-12 border-y border-[var(--shop-border)] py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-3 px-6">
        <span className="shop-display mr-4 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--shop-text-muted)]">
          Stocked
        </span>
        {brands.map((brand, i) => (
          <span key={brand.id} className="flex items-center gap-3">
            {i > 0 && <span className="text-[var(--shop-text-muted)]">/</span>}
            <span className="shop-display text-sm uppercase tracking-wide text-[var(--shop-text)]">
              {brand.name}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
