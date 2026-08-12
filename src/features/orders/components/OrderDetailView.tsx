"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { ApiError } from "@/shared/errors/api-error";
import { useOrder, useSupplierOrders } from "../hooks/useOrderDetail";
import { OrderStatusControl } from "./OrderStatusControl";
import { ShipmentStatusEditor } from "./ShipmentStatusEditor";
import {
  formatOrderDate,
  formatOrderDateTime,
  formatMoney,
  customerLabel,
  SUPPLIER_ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  formatStatusLabel,
} from "../lib/presentation";

export function OrderDetailView({ orderId }: { orderId: string }) {
  // Same tenantSlug/localStorage hydration hazard as the orders list.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  // A separate endpoint from the order detail's own `supplierOrders` field —
  // kept in sync with it via shared invalidation in useUpdateShipment, but
  // fetched independently here since it's a first-class API in its own right.
  const { data: supplierOrders } = useSupplierOrders(orderId);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (error instanceof ApiError && error.category === "NOT_FOUND") {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          Order not found.
        </p>
        <Link
          href="/orders"
          className="mt-3 inline-block text-xs font-medium text-[var(--shop-accent)]"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load this order.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] shadow-sm transition hover:border-[var(--shop-ink)]/20 hover:bg-[var(--shop-bg-soft)]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          All orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
              Placed {formatOrderDate(order.createdAt)} by{" "}
              {customerLabel(order.customer)}
            </p>
          </div>
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_0.6fr_1fr_1fr] items-center gap-3 border-b border-white/10 bg-[var(--shop-ink)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-band-text-muted)]">
          <span>Item</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span>Line total</span>
        </div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[2fr_0.6fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                {item.productTitle}
              </p>
              {(item.variantTitle || item.sku) && (
                <p className="truncate text-xs text-[var(--shop-text-muted)]">
                  {[item.variantTitle, item.sku].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <span className="text-xs text-[var(--shop-text-muted)]">
              {item.quantity}
            </span>
            <span className="text-xs text-[var(--shop-text-muted)]">
              {formatMoney(item.unitPrice, order.currency)}
            </span>
            <span className="text-xs font-semibold text-[var(--shop-text)]">
              {formatMoney(
                String(Number(item.unitPrice) * item.quantity),
                order.currency,
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Totals */}
        <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            Totals
          </h3>
          <dl className="space-y-1.5 text-sm">
            {(
              [
                ["Subtotal", order.subtotal],
                ["Discount", `-${order.discountAmount}`],
                ["Tax", order.taxAmount],
                ["Shipping", order.shippingAmount],
              ] as const
            ).map(([label, amount]) => (
              <div
                key={label}
                className="flex justify-between text-[var(--shop-text-muted)]"
              >
                <dt>{label}</dt>
                <dd>{formatMoney(amount, order.currency)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-[var(--shop-border)] pt-1.5 font-bold text-[var(--shop-text)]">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalAmount, order.currency)}</dd>
            </div>
          </dl>
        </div>

        {/* Shipping address */}
        <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
            Shipping address
          </h3>
          {order.shippingAddress ? (
            <address className="space-y-0.5 text-sm not-italic text-[var(--shop-text)]">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-[var(--shop-text-muted)]">
                  {order.shippingAddress.phone}
                </p>
              )}
            </address>
          ) : (
            <p className="text-sm text-[var(--shop-text-muted)]">
              No shipping address on file.
            </p>
          )}
        </div>
      </div>

      {/* Supplier orders + shipments */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Supplier fulfillment
        </h3>
        {!supplierOrders || supplierOrders.length === 0 ? (
          <p className="text-sm text-[var(--shop-text-muted)]">
            No supplier orders placed yet.
          </p>
        ) : (
          <div className="space-y-4">
            {supplierOrders.map((so) => {
              const style = SUPPLIER_ORDER_STATUS_STYLES[so.status];
              return (
                <div
                  key={so.id}
                  className="rounded-lg border border-[var(--shop-border)] p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--shop-text)]">
                      {so.supplier.displayName}
                      {so.externalId && (
                        <span className="ml-2 text-xs font-normal text-[var(--shop-text-muted)]">
                          #{so.externalId}
                        </span>
                      )}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {formatStatusLabel(so.status)}
                    </span>
                  </div>

                  {so.shipments.length === 0 ? (
                    <p className="text-xs text-[var(--shop-text-muted)]">
                      No shipments yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {so.shipments.map((shipment) => (
                        <ShipmentStatusEditor
                          key={shipment.id}
                          orderId={order.id}
                          shipment={shipment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-[18px]">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Payments
        </h3>
        {order.payments.length === 0 ? (
          <p className="text-sm text-[var(--shop-text-muted)]">
            No payment attempts recorded.
          </p>
        ) : (
          <div className="space-y-2">
            {order.payments.map((payment) => {
              const style = PAYMENT_STATUS_STYLES[payment.status];
              return (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--shop-border)] px-3 py-2"
                >
                  <div className="text-xs text-[var(--shop-text-muted)]">
                    {[payment.gateway, payment.channel, payment.instrument]
                      .filter(Boolean)
                      .join(" · ") || "Unspecified method"}
                    <span className="ml-2">
                      {formatOrderDateTime(payment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--shop-text)]">
                      {formatMoney(payment.amount, payment.currency)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {formatStatusLabel(payment.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
