"use client";

import { X as XIcon } from "lucide-react";

type ModalProps = {
  onClose: () => void;
  title: string;
  /** Shown under the title, e.g. the record being edited — stays visible once the body scrolls past its own copy of it. */
  subtitle?: string;
  /** Tailwind max-width class, e.g. "max-w-[480px]" — every modal picks its own based on content. */
  maxWidthClassName: string;
  /** Pinned below the scrollable body — action buttons, or a confirm-delete banner. Omit for a view-only modal. */
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shared modal shell — pinned header and (optional) pinned footer around a
 * scrollable body, so a long form's actions stay reachable without scrolling
 * and the rounded outer corners never get cut by the body's own scrollbar
 * (the body scrolls, not the outer card). Every modal in the app should
 * render through this instead of hand-rolling the overlay/panel/header
 * again, so they stay visually and structurally consistent by construction.
 */
export function Modal({
  onClose,
  title,
  subtitle,
  maxWidthClassName,
  footer,
  children,
}: ModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-shop-ink/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--shop-border)] px-6 py-4">
          <div className="min-w-0">
            <p className="shop-display truncate text-[17px] font-semibold text-[var(--shop-text)]">
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-[11.5px] text-[var(--shop-text-muted)]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--shop-text-muted)] transition-colors hover:bg-[var(--shop-bg)] hover:text-[var(--shop-text)]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="shop-scrollbar-light flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-[var(--shop-border)] p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
