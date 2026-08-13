import type { GetCollectionsParams } from "./collections.client";

export const collectionsKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionsKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached collections out of react-query's cache.
  list: (tenantSlug: string | null, params: GetCollectionsParams = {}) =>
    [...collectionsKeys.lists(), tenantSlug, params] as const,
} as const;
