"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  Search as SearchIcon,
} from "lucide-react";
import { useVariantStock } from "../hooks/useStock";
import { SetStockForm } from "./SetStockForm";
import { StockSummaryTable } from "./StockSummaryTable";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

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

/** /inventory/stock — cross-location stock rollup for one variant, looked up by ID. */
export function StockLookupView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [input, setInput] = useState("");
  const [variantId, setVariantId] = useState("");

  const { data, isLoading, isError, error } = useVariantStock(variantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVariantId(input.trim());
  };

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

      <form onSubmit={handleSubmit} className="mb-5 flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Variant ID"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <SearchIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Look up
        </button>
      </form>

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
