"use client";

import { useState } from "react";
import {
  type Shipment,
  type ShipmentStatus,
} from "../contracts/orders.contract";
import { useUpdateShipment } from "../hooks/useOrderDetail";
import {
  SHIPMENT_STATUS_STYLES,
  SHIPMENT_STATUS_OPTIONS,
  formatStatusLabel,
} from "../lib/presentation";
import { Dropdown } from "@/shared/components/Dropdown";

type ShipmentStatusEditorProps = {
  orderId: string;
  shipment: Shipment;
};

export function ShipmentStatusEditor({
  orderId,
  shipment,
}: ShipmentStatusEditorProps) {
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [trackingNumber, setTrackingNumber] = useState(
    shipment.trackingNumber ?? "",
  );
  const { mutate, isPending } = useUpdateShipment(orderId);
  const style = SHIPMENT_STATUS_STYLES[shipment.status];

  const dirty =
    status !== shipment.status ||
    trackingNumber !== (shipment.trackingNumber ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-2.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        {formatStatusLabel(shipment.status)}
      </span>

      <Dropdown
        value={status}
        options={SHIPMENT_STATUS_OPTIONS}
        onChange={(next) => setStatus(next as ShipmentStatus)}
        disabled={isPending}
        size="sm"
        aria-label="Change shipment status"
        className="w-40"
      />

      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        disabled={isPending}
        className="min-w-[9rem] flex-1 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1 text-[11px] text-[var(--shop-text)]"
      />

      <button
        type="button"
        disabled={isPending || !dirty}
        onClick={() =>
          mutate({
            shipmentId: shipment.id,
            status,
            trackingNumber: trackingNumber.trim() || undefined,
          })
        }
        className="rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--shop-accent-dark)" }}
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
