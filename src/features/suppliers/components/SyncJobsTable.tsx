"use client";

import { useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  ChevronDown as ChevronDownIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { SyncJob } from "../contracts/suppliers.contract";
import {
  SYNC_STATUS_STYLES,
  formatSyncLabel,
  formatSyncDateTime,
  formatSupplierName,
} from "../lib/presentation";
import { SyncJobLogs } from "./SyncJobLogs";

const GRID_COLS = "grid-cols-[1.3fr_1.2fr_0.9fr_1.1fr_1.1fr_28px]";

type SyncJobsTableProps = {
  jobs: SyncJob[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function SyncJobsTable({
  jobs,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: SyncJobsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const rows = jobs ?? [];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div
          className={`grid ${GRID_COLS} items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]`}
        >
          <span>Supplier</span>
          <span>Action</span>
          <span>Status</span>
          <span>Started</span>
          <span>Completed</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(4)].map((_, i) => (
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
                Couldn&apos;t load sync jobs
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching sync jobs."}
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
            No sync jobs have run yet.
          </p>
        ) : (
          rows.map((job) => {
            const style = SYNC_STATUS_STYLES[job.status];
            const isOpen = expanded === job.id;
            return (
              <div
                key={job.id}
                className="border-b border-[var(--shop-border)] last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : job.id)}
                  className={`grid w-full ${GRID_COLS} items-center gap-3 px-[18px] py-3.5 text-left transition hover:bg-[var(--shop-bg-soft)]`}
                >
                  <span className="truncate text-sm font-semibold text-[var(--shop-text)]">
                    {job.supplier.displayName ||
                      formatSupplierName(job.supplier.name)}
                  </span>
                  <span className="truncate text-xs text-[var(--shop-text-muted)]">
                    {formatSyncLabel(job.action)}
                  </span>
                  <span
                    className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: style.color }}
                    />
                    {formatSyncLabel(job.status)}
                  </span>
                  <span className="text-xs text-[var(--shop-text-muted)]">
                    {formatSyncDateTime(job.startedAt)}
                  </span>
                  <span className="text-xs text-[var(--shop-text-muted)]">
                    {formatSyncDateTime(job.completedAt)}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[var(--shop-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    strokeWidth={2.5}
                  />
                </button>
                {isOpen && (
                  <div className="shop-scope-fade border-t border-[var(--shop-border)] bg-[var(--shop-bg-soft)]">
                    {job.errorMessage && (
                      <p className="px-[18px] pt-3 text-xs font-semibold text-[var(--shop-danger)]">
                        {job.errorMessage}
                      </p>
                    )}
                    <SyncJobLogs jobId={job.id} />
                  </div>
                )}
              </div>
            );
          })
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
