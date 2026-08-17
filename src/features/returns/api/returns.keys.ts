import type { GetReturnsParams } from "./returns.client";

export const returnsKeys = {
  all: ["returns"] as const,
  lists: () => [...returnsKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached returns out of react-query's cache.
  list: (tenantSlug: string | null, params: GetReturnsParams) =>
    [...returnsKeys.lists(), tenantSlug, params] as const,
  byOrder: (orderId: string) =>
    [...returnsKeys.all, "by-order", orderId] as const,
};
