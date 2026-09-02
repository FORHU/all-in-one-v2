"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
} from "lucide-react";

type DateTimeFieldProps = {
  /**
   * `"datetime"` mode: an ISO 8601 string. `"date"` mode: a `yyyy-MM-dd`
   * string (local calendar day). `""` in either mode = nothing picked yet.
   */
  value: string;
  /** Fires with a fresh value in the same shape as `value`, or "" when cleared. */
  onChange: (value: string) => void;
  /** `"date"` drops the time row and emits `yyyy-MM-dd`. Default `"datetime"`. */
  mode?: "datetime" | "date";
  disabled?: boolean;
  /** Whether to show the inline clear (✕) affordance. Default `true`. */
  clearable?: boolean;
  /** ISO / `yyyy-MM-dd` — any day before this one cannot be picked. Time-of-day is ignored. */
  min?: string;
  /** ISO / `yyyy-MM-dd` — any day after this one cannot be picked. Time-of-day is ignored. */
  max?: string;
  /** Trigger text while `value` is "". */
  placeholder?: string;
  "aria-label"?: string;
  id?: string;
  className?: string;
};

/**
 * Accepts a full ISO string or a bare `yyyy-MM-dd`. The latter is read as a
 * *local* calendar day — `new Date("2026-09-24")` would otherwise be parsed as
 * UTC midnight and slip to the previous day in western timezones.
 */
function parseDateInput(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }
  return new Date(value);
}

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
/** Time defaulted onto a day picked while the field was still empty. */
const DEFAULT_HOUR = 9;
/** Rough panel height, used to decide whether to flip above the trigger. */
const PANEL_HEIGHT = 372;
const PANEL_WIDTH = 288;

const pad2 = (n: number) => String(n).padStart(2, "0");

function parse(value: string): Date | null {
  if (!value) return null;
  const d = parseDateInput(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function to12Hour(hours24: number): { hour12: number; meridiem: "AM" | "PM" } {
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour12, meridiem };
}

function to24Hour(hour12: number, meridiem: "AM" | "PM"): number {
  const base = hour12 % 12;
  return meridiem === "PM" ? base + 12 : base;
}

/**
 * A styled date + time picker meant to replace bare `<input type="datetime-local">`
 * everywhere in the app — that control's popup is browser/OS chrome and can't be
 * themed. Follows the same interaction contract as `Dropdown`: a trigger button,
 * a full-screen click-catcher behind the panel, and Escape-to-close with focus
 * returned to the trigger.
 *
 * The panel is rendered in a portal and positioned with `getBoundingClientRect`
 * so it is never clipped when the field sits low inside a scrollable modal body
 * (where an `absolute` panel would be cut off).
 *
 * Everything is computed in the browser's local time. `value`/`onChange` speak
 * ISO strings in the default `"datetime"` mode, or bare `yyyy-MM-dd` strings in
 * `"date"` mode (a drop-in for `<input type="date">`), so callers store them
 * directly.
 */
export function DateTimeField({
  value,
  onChange,
  mode = "datetime",
  disabled = false,
  clearable = true,
  min,
  max,
  placeholder,
  "aria-label": ariaLabel,
  id,
  className,
}: DateTimeFieldProps) {
  const isDateOnly = mode === "date";
  const resolvedPlaceholder =
    placeholder ?? (isDateOnly ? "Pick a date" : "Pick a date & time");
  const selected = useMemo(() => parse(value), [value]);
  const minDay = useMemo(
    () => (min ? startOfDay(parseDateInput(min)) : null),
    [min],
  );
  const maxDay = useMemo(
    () => (max ? startOfDay(parseDateInput(max)) : null),
    [max],
  );

  const emit = (day: Date) =>
    onChange(isDateOnly ? format(day, "yyyy-MM-dd") : day.toISOString());

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(
    () => selected ?? new Date(),
  );
  const [focusedDay, setFocusedDay] = useState<Date>(
    () => selected ?? new Date(),
  );
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Editable buffers for the HH / MM fields, so mid-typing ("1" before "12")
  // isn't clamped on every keystroke. Re-synced to the canonical padded value
  // whenever `selected` changes (including right after a commit).
  const [hourText, setHourText] = useState("");
  const [minuteText, setMinuteText] = useState("");
  useEffect(() => {
    if (selected) {
      setHourText(pad2(to12Hour(selected.getHours()).hour12));
      setMinuteText(pad2(selected.getMinutes()));
    } else {
      setHourText(pad2(DEFAULT_HOUR));
      setMinuteText("00");
    }
  }, [selected]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Re-seed the visible month / roving focus each time the panel opens, so it
  // always lands on the current selection rather than wherever it was left.
  useEffect(() => {
    if (!open) return;
    const anchor = selected ?? new Date();
    setViewMonth(startOfMonth(anchor));
    setFocusedDay(anchor);
  }, [open, selected]);

  useLayoutEffect(() => {
    if (!open) return;

    const reposition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flipUp = spaceBelow < PANEL_HEIGHT + 8 && rect.top > spaceBelow;
      setCoords({
        top: flipUp ? rect.top - PANEL_HEIGHT - 6 : rect.bottom + 6,
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8),
        ),
        width: rect.width,
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
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isDisabledDay = (day: Date) =>
    (minDay != null && isBefore(startOfDay(day), minDay)) ||
    (maxDay != null && isAfter(startOfDay(day), maxDay));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    // Always render 6 weeks so the panel height (and the flip calc) is stable.
    const grid = eachDayOfInterval({ start, end: addDays(start, 41) });
    return grid;
  }, [viewMonth]);

  const commitDay = (day: Date) => {
    if (isDisabledDay(day)) return;
    if (isDateOnly) {
      emit(day);
      // Nothing else to set — treat picking a day as the whole interaction.
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    emit(
      set(day, {
        hours: selected?.getHours() ?? DEFAULT_HOUR,
        minutes: selected?.getMinutes() ?? 0,
        seconds: 0,
        milliseconds: 0,
      }),
    );
  };

  const commitTime = (hours: number, minutes: number) => {
    const base = selected ?? set(focusedDay, { seconds: 0, milliseconds: 0 });
    emit(set(base, { hours, minutes, seconds: 0, milliseconds: 0 }));
  };

  const currentMeridiem: "AM" | "PM" = selected
    ? to12Hour(selected.getHours()).meridiem
    : "AM";
  const currentMinutes = selected?.getMinutes() ?? 0;

  /** Commit a 1–12 hour, keeping the current AM/PM and minutes. */
  const applyHour = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const h12 = Math.min(12, Math.max(1, n));
    commitTime(to24Hour(h12, currentMeridiem), currentMinutes);
  };

  /** Commit a 0–59 minute, keeping the current hour. */
  const applyMinute = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const m = Math.min(59, Math.max(0, n));
    const h24 =
      selected?.getHours() ??
      to24Hour(Number.parseInt(hourText, 10) || DEFAULT_HOUR, currentMeridiem);
    commitTime(h24, m);
  };

  const setMeridiem = (m: "AM" | "PM") => {
    const h12 = selected
      ? to12Hour(selected.getHours()).hour12
      : Number.parseInt(hourText, 10) || DEFAULT_HOUR;
    commitTime(to24Hour(h12, m), currentMinutes);
  };

  const stepHour = (delta: number) => {
    const h12 = selected
      ? to12Hour(selected.getHours()).hour12
      : Number.parseInt(hourText, 10) || DEFAULT_HOUR;
    applyHour(String(((h12 - 1 + delta + 12) % 12) + 1));
  };
  const stepMinute = (delta: number) => {
    applyMinute(String((currentMinutes + delta + 60) % 60));
  };

  const moveFocus = (nextDay: Date) => {
    setFocusedDay(nextDay);
    if (!isSameMonth(nextDay, viewMonth)) setViewMonth(startOfMonth(nextDay));
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>('[data-focused="true"]')
        ?.focus();
    });
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusedDay, -1),
      ArrowRight: () => addDays(focusedDay, 1),
      ArrowUp: () => addDays(focusedDay, -7),
      ArrowDown: () => addDays(focusedDay, 7),
      Home: () => startOfWeek(focusedDay),
      End: () => endOfWeek(focusedDay),
      PageUp: () => addMonths(focusedDay, -1),
      PageDown: () => addMonths(focusedDay, 1),
    };
    if (map[e.key]) {
      e.preventDefault();
      moveFocus(map[e.key]());
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commitDay(focusedDay);
    }
  };

  const panel = coords && (
    <>
      <button
        type="button"
        aria-label="Close date picker"
        className="fixed inset-0 z-[60] cursor-default"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-label={
          ariaLabel ?? (isDateOnly ? "Choose date" : "Choose date and time")
        }
        style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH }}
        className="shop-scope-fade fixed z-[61] rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] transition hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-text)]"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <p className="text-xs font-bold text-[var(--shop-text)]">
            {format(viewMonth, "MMMM yyyy")}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] transition hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-text)]"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]"
            >
              {d}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          role="grid"
          onKeyDown={onGridKeyDown}
          className="grid grid-cols-7 gap-0.5"
        >
          {days.map((day) => {
            const outside = !isSameMonth(day, viewMonth);
            const isSelected = selected != null && isSameDay(day, selected);
            const isFocused = isSameDay(day, focusedDay);
            const disabledDay = isDisabledDay(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                role="gridcell"
                data-focused={isFocused}
                aria-selected={isSelected}
                aria-current={isToday(day) ? "date" : undefined}
                disabled={disabledDay}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => commitDay(day)}
                className={cx(
                  "flex h-8 items-center justify-center rounded-md text-xs font-semibold transition",
                  "disabled:cursor-not-allowed disabled:opacity-30",
                  isSelected
                    ? "bg-[var(--shop-ink)] text-[var(--shop-bg)]"
                    : isToday(day)
                      ? "text-[var(--shop-accent)] hover:bg-[var(--shop-bg-soft)]"
                      : outside
                        ? "text-[var(--shop-text-muted)]/60 hover:bg-[var(--shop-bg-soft)]"
                        : "text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]",
                  isFocused && !isSelected
                    ? "ring-1 ring-inset ring-[var(--shop-accent)]"
                    : "",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {!isDateOnly && (
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--shop-border)]/60 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Time
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              {/* HH : MM — plain numeric fields, no native <select> popup */}
              <div className="flex items-center rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-1 focus-within:border-[var(--shop-accent)] focus-within:ring-2 focus-within:ring-[var(--shop-accent)]/25">
                <input
                  aria-label="Hour"
                  inputMode="numeric"
                  maxLength={2}
                  value={hourText}
                  onChange={(e) =>
                    setHourText(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  onBlur={() => applyHour(hourText)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyHour(hourText);
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      stepHour(1);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      stepHour(-1);
                    }
                  }}
                  className="w-7 bg-transparent py-1.5 text-center text-xs font-semibold text-[var(--shop-text)] outline-none"
                />
                <span className="text-xs font-bold text-[var(--shop-text-muted)]">
                  :
                </span>
                <input
                  aria-label="Minute"
                  inputMode="numeric"
                  maxLength={2}
                  value={minuteText}
                  onChange={(e) =>
                    setMinuteText(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  onBlur={() => applyMinute(minuteText)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyMinute(minuteText);
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      stepMinute(1);
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      stepMinute(-1);
                    }
                  }}
                  className="w-7 bg-transparent py-1.5 text-center text-xs font-semibold text-[var(--shop-text)] outline-none"
                />
              </div>
              {/* AM / PM — a segmented toggle, not a dropdown */}
              <div className="flex overflow-hidden rounded-lg border border-[var(--shop-border)]">
                {(["AM", "PM"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={currentMeridiem === m}
                    onClick={() => setMeridiem(m)}
                    className={cx(
                      "px-2 py-1.5 text-[11px] font-bold transition",
                      currentMeridiem === m
                        ? "bg-[var(--shop-ink)] text-[var(--shop-bg)]"
                        : "bg-[var(--shop-surface)] text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className={cx(
            "mt-3 flex items-center",
            clearable ? "justify-between" : "justify-end",
          )}
        >
          {clearable && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="rounded-md px-2 py-1 text-[11px] font-bold text-[var(--shop-text-muted)] transition hover:text-[var(--shop-danger)]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="rounded-md bg-[var(--shop-ink)] px-3 py-1.5 text-[11px] font-bold text-[var(--shop-bg)] transition hover:bg-[var(--shop-ink-soft)]"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cx(
        "relative flex items-center gap-1 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] pr-1.5 transition focus-within:border-[var(--shop-accent)]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:border-[var(--shop-ink)]/25",
        className,
      )}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[var(--shop-text)] outline-none disabled:cursor-not-allowed"
      >
        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-[var(--shop-text-muted)]" />
        <span
          className={cx(
            "min-w-0 flex-1 truncate",
            !selected && "text-[var(--shop-text-muted)]",
          )}
        >
          {selected
            ? format(
                selected,
                isDateOnly ? "MMM d, yyyy" : "EEE, MMM d, yyyy · h:mm a",
              )
            : resolvedPlaceholder}
        </span>
      </button>
      {selected && !disabled && clearable && (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => onChange("")}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--shop-text-muted)] transition hover:bg-[var(--shop-bg-soft)] hover:text-[var(--shop-danger)]"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {mounted && open && createPortal(panel, document.body)}
    </div>
  );
}
