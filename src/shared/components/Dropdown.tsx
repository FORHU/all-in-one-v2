"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    rowHeight: 30,
  },
  md: {
    trigger: "px-3 py-2 text-xs",
    option: "gap-2 px-2.5 py-2 text-xs",
    rowHeight: 34,
  },
};

const MAX_PANEL_HEIGHT = 256;
const GAP = 4;

/**
 * Custom listbox trigger + panel — a native <select>'s open panel is OS
 * chrome and can't be restyled. Follows the same interaction pattern as
 * DateTimeField: the panel is rendered in a portal and positioned with
 * getBoundingClientRect, so it is never clipped when the dropdown sits low
 * inside a scrollable container (a modal body), and it flips above the
 * trigger when there isn't room below. Escape closes and returns focus to
 * the trigger (a native <select> gets that for free; this wires it up).
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);
  const styles = SIZE_STYLES[size];

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;

    const reposition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const naturalHeight = Math.min(
        options.length * styles.rowHeight + 8,
        MAX_PANEL_HEIGHT,
      );
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const flipUp = spaceBelow < naturalHeight && spaceAbove > spaceBelow;
      const maxHeight = Math.min(
        naturalHeight,
        flipUp ? spaceAbove : spaceBelow,
      );
      setCoords({
        top: flipUp ? rect.top - maxHeight - GAP : rect.bottom + GAP,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    };

    reposition();
    window.addEventListener("resize", reposition);
    // capture: also fires for scrolls inside any ancestor (e.g. a modal body)
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, options.length, styles.rowHeight]);

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

  const panel = coords && (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[60] cursor-default"
        onClick={() => setOpen(false)}
      />
      <div
        role="listbox"
        style={{
          top: coords.top,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxHeight,
        }}
        className="shop-scope-fade fixed z-[61] overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg"
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
    </>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative flex w-full items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] text-left font-semibold text-[var(--shop-text)] shadow-sm transition",
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

      {mounted && open && createPortal(panel, document.body)}
    </div>
  );
}
