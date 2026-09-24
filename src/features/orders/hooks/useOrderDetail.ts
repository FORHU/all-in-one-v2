import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import {
  getOrder,
  updateOrderStatus,
  cancelOrder,
  rejectOrder,
  getSupplierOrders,
  updateShipment,
  placeOrderWithSupplier,
  type UpdateShipmentInput,
} from "../api/orders.client";
import { ordersKeys } from "../api/orders.keys";
import { formatStatusLabel } from "../lib/presentation";
import type { OrderStatus } from "../contracts/orders.contract";

/** Single order, full breakdown — items, shipping address, supplier orders, payments. */
export function useOrder(id: string) {
  return useSafeQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
}

/** Admin status transition. Updates the detail cache in place and refreshes the list. */
export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(orderId), order);
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      notify.success(
        `Order ${order.orderNumber} marked ${formatStatusLabel(order.status)}.`,
      );
    },
  });
}

/**
 * Cancels an order that hasn't been paid for yet — the backend 409s (message
 * surfaced by the global mutation-error toast) if any payment on it is
 * already PAID, in which case a refund is the only real option.
 */
export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(orderId), order);
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      notify.success(`Order ${order.orderNumber} cancelled.`);
    },
  });
}

/**
 * Declines to fulfill a paid order and issues a full refund in the same
 * action — only valid while the order is PROCESSING and hasn't already
 * been placed with a supplier (the backend 409s otherwise). Unlike
 * useCancelOrder, this always involves real money moving.
 */
export function useRejectOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (reason?: string) => rejectOrder(orderId, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(orderId), order);
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      notify.success(`Order ${order.orderNumber} rejected and refunded.`);
    },
  });
}

/**
 * Lets a sibling composed alongside OrderDetailView on the order detail page
 * (the Returns panel, a different feature) ask this order's cache to
 * refresh after an action that might have changed it — e.g. a refund that
 * flips the order to REFUNDED. Composed at the app layer only: the app
 * layer can't touch react-query directly, so it calls this instead, and no
 * feature imports another feature to get here.
 */
export function useRefreshOrder(orderId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
}

/** The supplier-side fulfillments backing this order (dropship/CJ etc.). */
export function useSupplierOrders(orderId: string) {
  return useSafeQuery({
    queryKey: ordersKeys.supplierOrders(orderId),
    queryFn: () => getSupplierOrders(orderId),
    enabled: Boolean(orderId),
  });
}

/**
 * Places (and pays for) this order with its supplier — real money moves on
 * the supplier's side once this succeeds. The response is just the new
 * CommerceSupplierOrder, not the full order, so — unlike useCancelOrder —
 * this can't hand-patch the detail cache directly; it invalidates the
 * order detail (status flips PENDING -> PROCESSING server-side), the
 * standalone supplier-orders query OrderDetailView actually renders from,
 * and the list (so its status badge updates too).
 */
export function usePlaceWithSupplier(orderId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: () => placeOrderWithSupplier(orderId),
    onSuccess: (supplierOrder) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      queryClient.invalidateQueries({
        queryKey: ordersKeys.supplierOrders(orderId),
      });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      notify.success(
        `Order placed with ${supplierOrder.supplier.displayName}.`,
      );
    },
  });
}

/**
 * Update one shipment's status/tracking. Shipments are only ever read as part
 * of the order detail response, so on success we invalidate both that and the
 * standalone supplier-orders query rather than hand-patching either cache.
 */
export function useUpdateShipment(orderId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({
      shipmentId,
      ...input
    }: UpdateShipmentInput & { shipmentId: string }) =>
      updateShipment(shipmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      queryClient.invalidateQueries({
        queryKey: ordersKeys.supplierOrders(orderId),
      });
      notify.success("Shipment updated.");
    },
  });
}
