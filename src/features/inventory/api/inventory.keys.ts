import type {
  GetLocationsParams,
  GetTransactionsParams,
} from "./inventory.client";

export const inventoryKeys = {
  all: ["inventory"] as const,

  locations: () => [...inventoryKeys.all, "locations"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached inventory out of react-query's cache.
  locationsList: (tenantSlug: string | null, params: GetLocationsParams) =>
    [...inventoryKeys.locations(), "list", tenantSlug, params] as const,
  locationDetail: (tenantSlug: string | null, id: string) =>
    [...inventoryKeys.locations(), "detail", tenantSlug, id] as const,

  stock: () => [...inventoryKeys.all, "stock"] as const,
  variantStock: (tenantSlug: string | null, variantId: string) =>
    [...inventoryKeys.stock(), tenantSlug, variantId] as const,

  transactions: () => [...inventoryKeys.all, "transactions"] as const,
  transactionsList: (
    tenantSlug: string | null,
    params: GetTransactionsParams,
  ) => [...inventoryKeys.transactions(), tenantSlug, params] as const,
};
