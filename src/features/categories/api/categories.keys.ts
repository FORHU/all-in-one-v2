export const categoriesKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached categories out of react-query's cache.
  list: (tenantSlug: string | null) =>
    [...categoriesKeys.lists(), tenantSlug] as const,
  details: () => [...categoriesKeys.all, "detail"] as const,
  detail: (tenantSlug: string | null, slug: string) =>
    [...categoriesKeys.details(), tenantSlug, slug] as const,
} as const;
