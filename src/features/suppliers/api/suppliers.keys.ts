export const suppliersKeys = {
  all: ["suppliers"] as const,
  lists: () => [...suppliersKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached supplier connections out of react-query's cache.
  list: (tenantSlug: string | null) =>
    [...suppliersKeys.lists(), tenantSlug] as const,
} as const;
