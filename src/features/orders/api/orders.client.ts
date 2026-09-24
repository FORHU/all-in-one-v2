import { fetcher } from "@/shared/lib/http";
import {
  OrdersResponseSchema,
  OrderDetailResponseSchema,
  SupplierOrdersResponseSchema,
  ShipmentResponseSchema,
  PlaceWithSupplierResponseSchema,
  type OrderStatus,
  type OrderDetail,
  type SupplierOrder,
  type Shipment,
  type ShipmentStatus,
} from "../contracts/orders.contract";

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "orderNumber" | "totalAmount" | "status";
  sortOrder?: "asc" | "desc";
  status?: OrderStatus;
};

/** GET /api/v2/orders — admin-only, requires x-tenant-slug (attached by http.ts). */
export const getOrders = async (params: GetOrdersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/orders${qs ? `?${qs}` : ""}`);
  return OrdersResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};

/** GET /api/v2/orders/:id — full order: items, shipping address, supplier orders, payments. */
export const getOrder = async (id: string): Promise<OrderDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${id}`);
  return OrderDetailResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/orders/:id/status — admin status transition. */
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<OrderDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return OrderDetailResponseSchema.parse(raw).data;
};

/** POST /api/v2/orders/:id/cancel — only allowed while no payment on the order is PAID. */
export const cancelOrder = async (id: string): Promise<OrderDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${id}/cancel`, {
    method: "POST",
  });
  return OrderDetailResponseSchema.parse(raw).data;
};

/**
 * POST /api/v2/orders/:id/reject — declines to fulfill a paid order and
 * issues a full refund. Only allowed while the order is PROCESSING and
 * hasn't already been placed with a supplier — see
 * OrderService.rejectOrder's doc comment.
 */
export const rejectOrder = async (
  id: string,
  reason?: string,
): Promise<OrderDetail> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return OrderDetailResponseSchema.parse(raw).data;
};

/** GET /api/v2/orders/:id/supplier-orders — the supplier-side fulfillments backing this order. */
export const getSupplierOrders = async (
  orderId: string,
): Promise<SupplierOrder[]> => {
  const raw = await fetcher<unknown>(
    `/api/v2/orders/${orderId}/supplier-orders`,
  );
  return SupplierOrdersResponseSchema.parse(raw).data;
};

export type UpdateShipmentInput = {
  status: ShipmentStatus;
  trackingNumber?: string;
};

/** PUT /api/v2/orders/shipments/:shipmentId — update one shipment's status/tracking. */
export const updateShipment = async (
  shipmentId: string,
  input: UpdateShipmentInput,
): Promise<Shipment> => {
  const raw = await fetcher<unknown>(`/api/v2/orders/shipments/${shipmentId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return ShipmentResponseSchema.parse(raw).data;
};

/**
 * POST /api/v2/orders/:id/place-with-supplier — actually places (and pays
 * for) this order with its supplier, e.g. CJ Dropshipping. Real, non-test
 * money on the supplier's side once this succeeds — see
 * CJOrderFulfillmentService.placeOrder's doc comment. Deliberately
 * CJ-only/all-or-nothing for now: the backend 422s if any line item isn't
 * sourced from a supplier this can place with.
 */
export const placeOrderWithSupplier = async (
  orderId: string,
): Promise<SupplierOrder> => {
  const raw = await fetcher<unknown>(
    `/api/v2/orders/${orderId}/place-with-supplier`,
    { method: "POST" },
  );
  return PlaceWithSupplierResponseSchema.parse(raw).data;
};
