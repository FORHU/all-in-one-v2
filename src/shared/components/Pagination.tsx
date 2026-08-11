"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disable both controls, e.g. while a refetch for the current page is in flight. */
  disabled?: boolean;
};

/** Previous/Next pager for API responses shaped like the FAOS PageResult envelope. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-3.5 flex items-center justify-between">
      <p className="text-xs text-[var(--shop-text-muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="flex items-center gap-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
