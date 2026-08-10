import type { GetCustomersParams } from "./customers.client";

export const customersKeys = {
  all: ["customers"] as const,
  lists: () => [...customersKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached customers out of react-query's cache.
  list: (tenantSlug: string | null, params: GetCustomersParams) =>
    [...customersKeys.lists(), tenantSlug, params] as const,
  details: () => [...customersKeys.all, "detail"] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
};
