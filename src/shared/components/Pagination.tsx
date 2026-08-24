"use client";

import { useEffect, useState } from "react";
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

/**
 * The admin shell's actual scrolling element is `<main id="admin-main-scroll">`
 * in AppShell (not `window`/`document` — the shell clamps to the viewport and
 * scrolls internally). Without this, paging while scrolled down to reach this
 * control in the first place leaves the next page's results scrolled past.
 */
function scrollResultsToTop() {
  document
    .getElementById("admin-main-scroll")
    ?.scrollTo({ top: 0, behavior: "smooth" });
}

/** Previous/Next pager for API responses shaped like the FAOS PageResult envelope. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  // Editable mirror of `page` — lets typing show intermediate values (e.g.
  // clearing the field to retype) without those being treated as real jumps
  // until committed. Re-syncs whenever `page` changes elsewhere (Previous/
  // Next, or the caller resetting it on a filter change).
  const [jumpValue, setJumpValue] = useState(String(page));
  useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  if (totalPages <= 1) return null;

  const goToPage = (next: number) => {
    onPageChange(next);
    scrollResultsToTop();
  };

  const commitJump = () => {
    const parsed = Math.trunc(Number(jumpValue));
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), totalPages)
      : page;
    setJumpValue(String(clamped));
    if (clamped !== page) goToPage(clamped);
  };

  return (
    <div className="mt-3.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-[var(--shop-text-muted)]">
        <span>Page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          disabled={disabled}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={commitJump}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitJump();
            }
          }}
          aria-label="Jump to page"
          className="w-12 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-1.5 py-1 text-center text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)] disabled:cursor-not-allowed disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span>of {totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={disabled || page <= 1}
          className="flex items-center gap-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
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
