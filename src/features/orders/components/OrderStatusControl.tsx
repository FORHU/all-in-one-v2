"use client";

import { useState } from "react";
import {
  ORDER_STATUS_VALUES,
  type OrderStatus,
} from "../contracts/orders.contract";
import { useUpdateOrderStatus } from "../hooks/useOrderDetail";
import { STATUS_STYLES, formatStatusLabel } from "../lib/presentation";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

type OrderStatusControlProps = {
  orderId: string;
  status: OrderStatus;
};

const STATUS_OPTIONS: DropdownOption[] = ORDER_STATUS_VALUES.map((s) => ({
  value: s,
  label: formatStatusLabel(s),
  indicatorColor: STATUS_STYLES[s].color,
}));

export function OrderStatusControl({
  orderId,
  status,
}: OrderStatusControlProps) {
  const [pending, setPending] = useState<OrderStatus>(status);
  const { mutate, isPending } = useUpdateOrderStatus(orderId);
  const style = STATUS_STYLES[status];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: style.color }}
        />
        {formatStatusLabel(status)}
      </span>

      <Dropdown
        value={pending}
        options={STATUS_OPTIONS}
        onChange={(next) => setPending(next as OrderStatus)}
        disabled={isPending}
        aria-label="Change order status"
        className="w-44"
      />

      <button
        type="button"
        disabled={isPending || pending === status}
        onClick={() => mutate(pending)}
        className="rounded-full px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--shop-accent-dark)" }}
      >
        {isPending ? "Updating…" : "Update status"}
      </button>
    </div>
  );
}
