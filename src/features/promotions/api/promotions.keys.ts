import type { GetPromotionsParams } from "./promotions.client";

export const promotionsKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionsKeys.all, "list"] as const,
  // Tenant slug + params are part of the key so switching stores or pages
  // never reads another store's (or another page's) cached promotions.
  list: (tenantSlug: string | null, params: GetPromotionsParams = {}) =>
    [...promotionsKeys.lists(), tenantSlug, params] as const,
} as const;
