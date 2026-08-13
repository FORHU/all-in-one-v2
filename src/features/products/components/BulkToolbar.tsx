"use client";

import { X as XIcon } from "lucide-react";

type BulkToolbarProps = {
  selectedCount: number;
  onClear: () => void;
};

export function BulkToolbar({ selectedCount, onClear }: BulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-3 flex items-center justify-between rounded-xl bg-[var(--shop-ink)] px-[18px] py-2.5 text-[var(--shop-bg)]">
      <span className="text-sm font-semibold">{selectedCount} selected</span>
      <div className="flex gap-2">
        <button className="rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-bold hover:bg-white/10">
          Archive
        </button>
        <button className="rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-bold hover:bg-white/10">
          Export
        </button>
        <button className="rounded-md bg-[var(--shop-accent)] px-3.5 py-1.5 text-xs font-bold text-[var(--shop-ink)] hover:bg-[var(--shop-accent)]/80">
          Delete
        </button>
        <button
          onClick={onClear}
          aria-label="Clear selection"
          className="rounded-md px-2.5 py-1.5 text-xs text-white/50 hover:text-white"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
