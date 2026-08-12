import type { GetOrdersParams } from "./orders.client";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached orders out of react-query's cache.
  list: (tenantSlug: string | null, params: GetOrdersParams) =>
    [...ordersKeys.lists(), tenantSlug, params] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  supplierOrders: (orderId: string) =>
    [...ordersKeys.detail(orderId), "supplier-orders"] as const,
};
