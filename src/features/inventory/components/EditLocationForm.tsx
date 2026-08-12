"use client";

import { useEffect, useState } from "react";
import { Save as SaveIcon } from "lucide-react";
import { useUpdateLocation } from "../hooks/useLocations";
import { LOCATION_TYPE_VALUES } from "../contracts/inventory.contract";
import type { InventoryLocation } from "../contracts/inventory.contract";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { locationTypeLabel } from "../lib/presentation";

const TYPE_OPTIONS: DropdownOption[] = LOCATION_TYPE_VALUES.map((t) => ({
  value: t,
  label: locationTypeLabel(t),
}));

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

type EditLocationFormProps = {
  location: InventoryLocation;
};

/** Edits name/code/type/isPrimary/isActive for one already-loaded location. */
export function EditLocationForm({ location }: EditLocationFormProps) {
  const [name, setName] = useState(location.name);
  const [code, setCode] = useState(location.code);
  const [type, setType] = useState(location.type);
  const [isPrimary, setIsPrimary] = useState(location.isPrimary);
  const [isActive, setIsActive] = useState(location.isActive);

  // The detail query can refetch (e.g. after a stock change elsewhere)
  // with fresh values — keep the form in sync unless the user is mid-edit.
  useEffect(() => {
    setName(location.name);
    setCode(location.code);
    setType(location.type);
    setIsPrimary(location.isPrimary);
    setIsActive(location.isActive);
  }, [location]);

  const { mutate: update, isPending } = useUpdateLocation(location.id);

  const dirty =
    name !== location.name ||
    code !== location.code ||
    type !== location.type ||
    isPrimary !== location.isPrimary ||
    isActive !== location.isActive;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update({ name, code, type, isPrimary, isActive });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]"
    >
      <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        Location Details
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto_auto_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          disabled={isPending}
          className={inputClass}
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          disabled={isPending}
          className={inputClass}
        />
        <Dropdown
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
          disabled={isPending}
          aria-label="Location type"
        />
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--shop-text-muted)]">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            disabled={isPending}
            className="h-3.5 w-3.5 accent-[var(--shop-accent)]"
          />
          Primary
        </label>
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--shop-text-muted)]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
            className="h-3.5 w-3.5 accent-[var(--shop-accent)]"
          />
          Active
        </label>
        <button
          type="submit"
          disabled={isPending || !dirty || !name.trim() || !code.trim()}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <SaveIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
