import { CATEGORY_META, PRODUCTS } from "../data/mock-products";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORY_META.map((c) => {
        const count = PRODUCTS.filter((p) => p.category === c.name).length;
        return (
          <div
            key={c.name}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className="relative flex h-24 items-center justify-end overflow-hidden pr-3.5"
              style={{ background: c.bandColor }}
            >
              <span className="shop-display text-[56px] font-bold leading-none text-white/20">
                {c.numeral}
              </span>
            </div>
            <div className="p-4">
              <p className="shop-display mb-1 text-[15px] font-semibold text-[var(--shop-text)]">
                {c.name}
              </p>
              <p className="text-xs text-[var(--shop-text-muted)]">
                {count} products
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
