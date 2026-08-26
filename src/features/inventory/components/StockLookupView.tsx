"use client";

import { useEffect, useState } from "react";
import { AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { useVariantStock } from "../hooks/useStock";
import { SetStockForm } from "./SetStockForm";
import { StockSummaryTable } from "./StockSummaryTable";
import { VariantPicker } from "./VariantPicker";

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--shop-text)]">{value}</p>
    </div>
  );
}

/**
 * /inventory/stock — cross-location stock rollup for one variant. Admins
 * don't know a variant's raw id, so this is search-driven: find a product by
 * name, then (if it has more than one variant) pick which one. A single
 * variant is selected automatically — nothing to disambiguate. A
 * `?variantId=` query param skips straight to the result, for a link from
 * elsewhere that already knows the id.
 */
export function StockLookupView() {
  const [mounted, setMounted] = useState(false);
  const [variantId, setVariantId] = useState("");

  useEffect(() => {
    setMounted(true);
    // Read directly off window.location rather than useSearchParams — that
    // hook forces this page out of static rendering and requires a Suspense
    // boundary; a plain read inside this mount effect avoids both for a
    // one-time initial value. Same pattern as the admin Products page.
    const params = new URLSearchParams(window.location.search);
    const initialVariantId = params.get("variantId")?.trim();
    if (initialVariantId) setVariantId(initialVariantId);
  }, []);

  const { data, isLoading, isError, error } = useVariantStock(variantId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Stock Lookup
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Cross-location onHand / reserved / available for one product variant.
        </p>
      </div>

      <VariantPicker variantId={variantId} onChange={setVariantId} />

      {!variantId ? null : !mounted || isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]" />
      ) : isError ? (
        <div role="alert" className="flex items-center gap-2.5 p-6">
          <AlertTriangleIcon
            className="h-5 w-5 flex-shrink-0"
            style={{ color: "var(--shop-danger)" }}
            strokeWidth={2.25}
          />
          <p className="text-sm text-[var(--shop-text-muted)]">
            {error instanceof Error
              ? error.message
              : "Couldn't find stock for that variant."}
          </p>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatChip label="On Hand" value={data.totalOnHand} />
            <StatChip label="Reserved" value={data.totalReserved} />
            <StatChip label="Available" value={data.totalAvailable} />
          </div>
          <SetStockForm fixedVariantId={variantId} />
          <StockSummaryTable rows={data.locations} />
        </div>
      ) : null}
    </div>
  );
}
