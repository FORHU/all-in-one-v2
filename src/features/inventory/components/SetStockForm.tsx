"use client";

import { useState } from "react";
import { PackageCheck as PackageCheckIcon } from "lucide-react";
import { useSetStock } from "../hooks/useStock";
import { useLocations } from "../hooks/useLocations";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

type SetStockFormProps = {
  /** Pass when this form lives on a single location's page — hides the location picker. */
  fixedLocationId?: string;
  /** Pass when this form lives on a single variant's stock-lookup page — hides the variant field. */
  fixedVariantId?: string;
};

/** POST /api/v2/inventory/stock — upserts onHand + reorderPoint for one variant/location pair. */
export function SetStockForm({
  fixedLocationId,
  fixedVariantId,
}: SetStockFormProps) {
  const [variantId, setVariantId] = useState("");
  const [locationId, setLocationId] = useState(fixedLocationId ?? "");
  const [onHand, setOnHand] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");

  // 100 = the backend's max page size — this is a picker, not a paginated
  // list, so pull as many locations as the API will return in one page.
  const { data: locationsPage } = useLocations({ limit: 100 });
  const locationOptions: DropdownOption[] = (locationsPage?.items ?? []).map(
    (l) => ({
      value: l.id,
      label: `${l.name} (${l.code})`,
    }),
  );

  const { mutate: submit, isPending } = useSetStock();

  const effectiveVariantId = fixedVariantId ?? variantId;
  const canSubmit =
    Boolean(effectiveVariantId.trim()) &&
    Boolean(locationId) &&
    onHand.trim() !== "" &&
    !Number.isNaN(Number(onHand));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    submit(
      {
        variantId: effectiveVariantId.trim(),
        locationId,
        onHand: Number(onHand),
        ...(reorderPoint.trim() !== ""
          ? { reorderPoint: Number(reorderPoint) }
          : {}),
      },
      {
        onSuccess: () => {
          if (!fixedVariantId) setVariantId("");
          setOnHand("");
          setReorderPoint("");
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
        Set Stock
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1.4fr_0.8fr_0.8fr_auto]">
        {!fixedVariantId && (
          <input
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            placeholder="Variant ID"
            disabled={isPending}
            className={inputClass}
          />
        )}
        {!fixedLocationId && (
          <Dropdown
            value={locationId}
            options={locationOptions}
            onChange={setLocationId}
            disabled={isPending || locationOptions.length === 0}
            aria-label="Location"
            className={fixedVariantId ? "sm:col-span-2" : undefined}
          />
        )}
        <input
          type="number"
          min={0}
          value={onHand}
          onChange={(e) => setOnHand(e.target.value)}
          placeholder="On hand"
          disabled={isPending}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          value={reorderPoint}
          onChange={(e) => setReorderPoint(e.target.value)}
          placeholder="Reorder pt."
          disabled={isPending}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PackageCheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
