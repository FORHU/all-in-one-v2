"use client";

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getTenants } from "../api/tenants.client";
import { tenantsKeys } from "../api/tenants.keys";

/**
 * Fetches the list of tenants this super-admin can manage. No tenant is
 * auto-selected — an unset `tenantSlug` is the "Platform" scope (all stores),
 * which is the intended default until the admin picks a specific store.
 */
export function useTenants() {
  return useSafeQuery({
    queryKey: tenantsKeys.lists(),
    queryFn: getTenants,
    staleTime: 5 * 60 * 1000,
  });
}
