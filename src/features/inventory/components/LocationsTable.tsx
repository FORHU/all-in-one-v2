"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle as AlertTriangleIcon,
  RotateCw as RotateCwIcon,
  Star as StarIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { InventoryLocation } from "../contracts/inventory.contract";
import { locationTypeLabel } from "../lib/presentation";

type LocationsTableProps = {
  locations: InventoryLocation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function LocationsTable({
  locations,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: LocationsTableProps) {
  const rows = useMemo(() => locations ?? [], [locations]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.8fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
          <span>Location</span>
          <span>Code</span>
          <span>Type</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
              />
            ))}
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
                Couldn&apos;t load inventory locations
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching locations."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No inventory locations yet. Create one below.
          </p>
        ) : (
          rows.map((loc) => (
            <Link
              key={loc.id}
              href={`/inventory/${loc.id}`}
              className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.8fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 transition hover:bg-[var(--shop-bg-soft)] last:border-b-0"
            >
              <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--shop-text)]">
                {loc.name}
                {loc.isPrimary && (
                  <StarIcon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--shop-accent)" }}
                    fill="var(--shop-accent)"
                    strokeWidth={0}
                  />
                )}
              </span>
              <span className="truncate text-xs text-[var(--shop-text-muted)]">
                {loc.code}
              </span>
              <span className="truncate text-xs text-[var(--shop-text-muted)]">
                {locationTypeLabel(loc.type)}
              </span>
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{
                  background: loc.isActive
                    ? "var(--shop-success-bg)"
                    : "var(--shop-neutral-bg)",
                  color: loc.isActive
                    ? "var(--shop-success)"
                    : "var(--shop-neutral)",
                }}
              >
                {loc.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-right text-xs font-semibold text-[var(--shop-accent)]">
                View →
              </span>
            </Link>
          ))
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
