"use client";

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getTenants } from "../api/tenants.client";
import { tenantsKeys } from "../api/tenants.keys";

/**
 * Fetches the list of tenants this super-admin can manage. No tenant is
 * auto-selected — an unset `tenantSlug` is the "Platform" scope (all stores),
 * which is the intended default until the admin picks a specific store.
 *
 * Hits GET /api/v2/tenants/all, which requires the `platform:manage`
 * permission (only SUPER_ADMIN/DEVELOPER accounts have it — regular
 * per-tenant staff get `[]`). This is called from the admin layout on every
 * page to populate the sidebar's store switcher, so callers WITHOUT that
 * permission must pass `enabled: false` — otherwise every admin page load
 * fires a 403 for staff who are scoped to a single tenant and have no use
 * for a store switcher anyway.
 */
export function useTenants(options?: { enabled?: boolean }) {
  return useSafeQuery({
    queryKey: tenantsKeys.lists(),
    queryFn: getTenants,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
