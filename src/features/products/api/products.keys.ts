import type { GetAdminProductsParams } from "./products.client";

export const productsKeys = {
  all: ["products"] as const,
  lists: () => [...productsKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached products out of react-query's cache.
  list: (tenantSlug: string | null, params: GetAdminProductsParams) =>
    [...productsKeys.lists(), tenantSlug, params] as const,
};
