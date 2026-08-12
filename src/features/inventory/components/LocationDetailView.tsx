"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle as AlertTriangleIcon,
  ArrowLeft as ArrowLeftIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { useLocation } from "../hooks/useLocations";
import { EditLocationForm } from "./EditLocationForm";
import { SetStockForm } from "./SetStockForm";
import { LocationStocksTable } from "./LocationStocksTable";

type LocationDetailViewProps = {
  id: string;
};

/** /inventory/:id — one location's details plus every variant stocked there. */
export function LocationDetailView({ id }: LocationDetailViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    data: location,
    isLoading,
    isError,
    error,
    refetch,
  } = useLocation(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--shop-text-muted)] hover:text-[var(--shop-text)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        All locations
      </Link>

      {!mounted || isLoading ? (
        <div className="space-y-3">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]" />
          <div className="h-24 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]" />
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-start gap-3 p-6">
          <div className="flex items-center gap-2.5">
            <AlertTriangleIcon
              className="h-5 w-5 flex-shrink-0"
              style={{ color: "var(--shop-danger)" }}
              strokeWidth={2.25}
            />
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              Couldn&apos;t load this location
            </p>
          </div>
          <p className="text-sm text-[var(--shop-text-muted)]">
            {error instanceof Error
              ? error.message
              : "Something went wrong while fetching this location."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            Try again
          </button>
        </div>
      ) : location ? (
        <div className="space-y-5">
          <div>
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {location.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
              {location.stocks.length} variant
              {location.stocks.length === 1 ? "" : "s"} stocked here
            </p>
          </div>

          <EditLocationForm location={location} />
          <SetStockForm fixedLocationId={location.id} />
          <LocationStocksTable stocks={location.stocks} />
        </div>
      ) : null}
    </div>
  );
}
