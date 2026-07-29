import { BRANDS } from "../data/mock-products";

export function BrandGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BRANDS.map((b) => (
        <div
          key={b.name}
          className="flex cursor-pointer flex-col gap-3.5 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div
            className="shop-display flex h-11 w-11 items-center justify-center rounded-[10px] text-base font-bold text-white"
            style={{ background: b.tileColor }}
          >
            {b.initials}
          </div>
          <div>
            <p className="mb-0.5 text-sm font-bold text-[var(--shop-text)]">
              {b.name}
            </p>
            <p className="text-xs text-[var(--shop-text-muted)]">
              {b.count} products · {b.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
