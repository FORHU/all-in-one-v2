import { SupplierGrid } from "@/features/suppliers/components/SupplierGrid";

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          All Suppliers
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          View and manage all supplier records.
        </p>
      </div>
      <SupplierGrid />
    </div>
  );
}
