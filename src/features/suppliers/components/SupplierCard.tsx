import type { Supplier } from "../contracts/suppliers.contract";
import {
  formatSupplierName,
  initials,
  supplierAvatarColor,
} from "../lib/presentation";

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const name = formatSupplierName(supplier.id);
  return (
    <div className="flex cursor-pointer flex-col gap-3.5 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="shop-display flex h-11 w-11 items-center justify-center rounded-[10px] text-base font-bold text-white"
        style={{ background: supplierAvatarColor(supplier.id) }}
      >
        {initials(name)}
      </div>
      <div>
        <p className="mb-0.5 text-sm font-bold text-[var(--shop-text)]">
          {name}
        </p>
        <p className="text-xs text-[var(--shop-text-muted)]">Available</p>
      </div>
    </div>
  );
}
