import { COLLECTIONS } from "../data/mock-products";

export function CollectionGrid() {
  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
      {COLLECTIONS.map((col) => (
        <div
          key={col.name}
          className="cursor-pointer overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div
            className="flex h-[140px] items-end p-3.5"
            style={{
              background: `repeating-linear-gradient(135deg, ${col.swatchA}, ${col.swatchA} 10px, ${col.swatchB} 10px, ${col.swatchB} 20px)`,
            }}
          >
            <span className="rounded-full bg-[var(--shop-ink)]/55 px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-bg)]">
              Cover pending
            </span>
          </div>
          <div className="p-4">
            <p className="shop-display mb-1 text-[15px] font-semibold text-[var(--shop-text)]">
              {col.name}
            </p>
            <p className="text-xs text-[var(--shop-text-muted)]">
              {col.count} items · {col.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
