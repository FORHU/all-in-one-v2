"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  /** Small colored dot before the label — lets a status dropdown match its badge color. */
  indicatorColor?: string;
};

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
};

const SIZE_STYLES = {
  sm: {
    trigger: "px-2.5 py-1.5 text-[11px]",
    option: "gap-2 px-2.5 py-1.5 text-[11px]",
  },
  md: { trigger: "px-3 py-2 text-xs", option: "gap-2 px-2.5 py-2 text-xs" },
};

/**
 * Custom listbox trigger + panel — a native <select>'s open panel is OS
 * chrome and can't be restyled. Follows the same interaction pattern already
 * used by the sidebar's store switcher (AppSidebar): a trigger button, an
 * invisible full-screen button behind the panel to close on outside click,
 * and Escape-to-close with focus returned to the trigger (native <select>
 * gets that for free; this has to wire it up itself).
 */
export function Dropdown({
  value,
  options,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);
  const styles = SIZE_STYLES[size];

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative z-50 flex w-full items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] text-left font-semibold text-[var(--shop-text)] shadow-sm transition",
          "hover:border-[var(--shop-ink)]/25 disabled:cursor-not-allowed disabled:opacity-50",
          styles.trigger,
        ].join(" ")}
      >
        {selected?.indicatorColor && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: selected.indicatorColor }}
          />
        )}
        <span className="min-w-0 flex-1 truncate">
          {selected?.label ?? "Select…"}
        </span>
        <ChevronDownIcon
          className={[
            "h-3.5 w-3.5 shrink-0 text-[var(--shop-text-muted)] transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="shop-scope-fade absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-64 overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setOpen(false);
                  if (option.value !== value) onChange(option.value);
                }}
                className={[
                  "flex w-full items-center rounded-md text-left transition",
                  isSelected
                    ? "bg-[color-mix(in_srgb,var(--shop-accent)_10%,transparent)] text-[var(--shop-text)]"
                    : "text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]",
                  styles.option,
                ].join(" ")}
              >
                {option.indicatorColor && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: option.indicatorColor }}
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--shop-accent)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
