import { fetcher } from "@/shared/lib/http";
import {
  OrdersResponseSchema,
  OrderDetailResponseSchema,
  SupplierOrdersResponseSchema,
  ShipmentResponseSchema,
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
