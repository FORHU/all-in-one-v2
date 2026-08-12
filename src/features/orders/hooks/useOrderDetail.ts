import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import {
  getOrder,
  updateOrderStatus,
  getSupplierOrders,
  updateShipment,
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

/** The supplier-side fulfillments backing this order (dropship/CJ etc.). */
export function useSupplierOrders(orderId: string) {
  return useSafeQuery({
    queryKey: ordersKeys.supplierOrders(orderId),
    queryFn: () => getSupplierOrders(orderId),
    enabled: Boolean(orderId),
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
