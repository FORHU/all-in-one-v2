"use client";

import { useEffect, useRef, useState } from "react";
import { Check as CheckIcon, Search as SearchIcon } from "lucide-react";
import { Dropdown } from "@/shared/components/Dropdown";
import { PromotionSectionPanel, PromotionRow } from "./PromotionSectionPanel";
import {
  TARGET_OPTIONS,
  inputClass,
  makeRowKey,
  type TargetDraft,
} from "./promotion-form-model";
import { useTargetSearch } from "../hooks/usePromotions";

const SEARCHABLE = ["PRODUCT", "COLLECTION", "CATEGORY"];

type Props = {
  rows: TargetDraft[];
  errors: Record<string, string>;
  disabled?: boolean;
  onChange: (rows: TargetDraft[]) => void;
};

export function PromotionTargetsEditor({
  rows,
  errors,
  disabled,
  onChange,
}: Props) {
  const patch = (key: string, next: Partial<TargetDraft>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...next } : r)));

  return (
    <PromotionSectionPanel
      title="Applies to"
      hint="Which line items the reward is calculated against. “Whole cart” = everything."
      addLabel="Add target"
      onAdd={() =>
        onChange([
          ...rows,
          {
            key: makeRowKey(),
            targetType: "PRODUCT",
            targetId: "",
            targetLabel: "",
          },
        ])
      }
    >
      {rows.map((row) => (
        <PromotionRow
          key={row.key}
          onRemove={() => onChange(rows.filter((r) => r.key !== row.key))}
          removeLabel="Remove target"
          error={errors[row.key]}
        >
          <label className="sr-only" htmlFor={`target-type-${row.key}`}>
            Target type
          </label>
          <Dropdown
            value={row.targetType}
            options={TARGET_OPTIONS}
            disabled={disabled}
            aria-label="Target type"
            onChange={(v) =>
              patch(row.key, { targetType: v, targetId: "", targetLabel: "" })
            }
          />

          {row.targetType === "VARIANT" && (
            <>
              <label className="sr-only" htmlFor={`target-variant-${row.key}`}>
                Variant ID
              </label>
              <input
                id={`target-variant-${row.key}`}
                value={row.targetId}
                onChange={(e) => patch(row.key, { targetId: e.target.value })}
                placeholder="Variant ID"
                disabled={disabled}
                className={inputClass}
              />
              <p className="text-[10px] text-[var(--shop-text-muted)]">
                No variant search yet — paste the variant ID.
              </p>
            </>
          )}

          {SEARCHABLE.includes(row.targetType) && (
            <TargetEntityPicker
              rowKey={row.key}
              targetType={row.targetType}
              selectedId={row.targetId}
              selectedLabel={row.targetLabel}
              disabled={disabled}
              onPick={(id, label) =>
                patch(row.key, { targetId: id, targetLabel: label })
              }
              onClear={() => patch(row.key, { targetId: "", targetLabel: "" })}
            />
          )}
        </PromotionRow>
      ))}
    </PromotionSectionPanel>
  );
}

function TargetEntityPicker({
  rowKey,
  targetType,
  selectedId,
  selectedLabel,
  disabled,
  onPick,
  onClear,
}: {
  rowKey: string;
  targetType: string;
  selectedId: string;
  selectedLabel: string;
  disabled?: boolean;
  onPick: (id: string, label: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const { data: options = [], isFetching } = useTargetSearch(
    targetType,
    debounced,
  );
  const noun = targetType.toLowerCase();

  if (selectedId) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-2.5 py-2">
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--shop-success)]" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--shop-text)]">
          {selectedLabel || selectedId}
        </span>
        <button
          type="button"
          onClick={() => {
            onClear();
            setQuery("");
          }}
          disabled={disabled}
          className="shrink-0 text-[10.5px] font-bold text-[var(--shop-text-muted)] hover:text-[var(--shop-danger)]"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="sr-only" htmlFor={`target-search-${rowKey}`}>
        Search for a {noun}
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--shop-text-muted)]" />
        <input
          id={`target-search-${rowKey}`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            targetType === "CATEGORY"
              ? `Filter categories…`
              : `Search ${noun}s…`
          }
          disabled={disabled}
          autoComplete="off"
          className={`${inputClass} pl-7`}
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[70] max-h-56 overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg">
          {isFetching ? (
            <p className="px-2.5 py-2 text-[11px] text-[var(--shop-text-muted)]">
              Searching…
            </p>
          ) : options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] text-[var(--shop-text-muted)]">
              {targetType === "CATEGORY" || debounced.trim().length >= 2
                ? `No ${noun}s found.`
                : `Type at least 2 characters.`}
            </p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onPick(opt.id, opt.label);
                  setOpen(false);
                  setQuery("");
                }}
                className="block w-full truncate rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
