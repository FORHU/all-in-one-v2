export const collectionsKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionsKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached collections out of react-query's cache.
  list: (tenantSlug: string | null) =>
    [...collectionsKeys.lists(), tenantSlug] as const,
} as const;
