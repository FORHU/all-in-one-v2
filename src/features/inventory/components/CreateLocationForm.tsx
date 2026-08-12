"use client";

import { useState } from "react";
import { Plus as PlusIcon } from "lucide-react";
import { useCreateLocation } from "../hooks/useLocations";
import { LOCATION_TYPE_VALUES } from "../contracts/inventory.contract";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { locationTypeLabel } from "../lib/presentation";

const TYPE_OPTIONS: DropdownOption[] = LOCATION_TYPE_VALUES.map((t) => ({
  value: t,
  label: locationTypeLabel(t),
}));

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

export function CreateLocationForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<string>(LOCATION_TYPE_VALUES[0]);
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: create, isPending } = useCreateLocation({
    onValidationError: (fields) => {
      const mapped: Record<string, string> = {};
      Object.entries(fields).forEach(([k, v]) => {
        mapped[k] = v[0] ?? "Invalid";
      });
      setErrors(mapped);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    create(
      { name, code, type, isPrimary },
      {
        onSuccess: () => {
          setName("");
          setCode("");
          setType(LOCATION_TYPE_VALUES[0]);
          setIsPrimary(false);
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]"
    >
      <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
        New Location
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Main Warehouse)"
            disabled={isPending}
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code (e.g. WH-MAIN-01)"
            disabled={isPending}
            className={inputClass}
          />
          {errors.code && (
            <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
              {errors.code}
            </p>
          )}
        </div>
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
        <button
          type="submit"
          disabled={isPending || !name.trim() || !code.trim()}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {isPending ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
}
