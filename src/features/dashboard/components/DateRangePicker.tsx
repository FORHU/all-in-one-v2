"use client";

import { lastNDaysRange, TODAY_ISO, type DateRange } from "../lib/date-range";

const PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(lastNDaysRange(preset.days))}
            className="rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-bold text-[var(--shop-text-muted)] transition hover:border-[var(--shop-accent)] hover:text-[var(--shop-text)]"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--shop-text-muted)]">
        <input
          type="date"
          value={value.startDate}
          max={value.endDate}
          onChange={(e) =>
            onChange({ startDate: e.target.value, endDate: value.endDate })
          }
          className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2.5 py-1.5 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        <span>to</span>
        <input
          type="date"
          value={value.endDate}
          min={value.startDate}
          max={TODAY_ISO}
          onChange={(e) =>
            onChange({ startDate: value.startDate, endDate: e.target.value })
          }
          className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2.5 py-1.5 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
      </div>
    </div>
  );
}
