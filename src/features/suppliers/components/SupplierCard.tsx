import Link from "next/link";
import { ArrowUpRight as ArrowUpRightIcon } from "lucide-react";
import type { Supplier } from "../contracts/suppliers.contract";
import {
  formatSupplierName,
  initials,
  supplierAvatarColor,
} from "../lib/presentation";

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const name = formatSupplierName(supplier.id);
  const accent = supplierAvatarColor(supplier.id);

  return (
    <Link
      href="/suppliers/sync-history"
      className="group relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between">
        <div
          className="shop-display flex h-11 w-11 items-center justify-center rounded-[10px] text-base font-bold text-white"
          style={{ background: accent }}
        >
          {initials(name)}
        </div>
        <ArrowUpRightIcon
          className="h-4 w-4 text-[var(--shop-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={2.5}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-bold text-[var(--shop-text)]">
          {name}
        </p>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: "var(--shop-success-bg)",
            color: "var(--shop-success)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--shop-success)" }}
          />
          Available
        </span>
      </div>
    </Link>
  );
}
