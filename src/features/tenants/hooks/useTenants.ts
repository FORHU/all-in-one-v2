"use client";

import { useEffect } from "react";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getTenants } from "../api/tenants.client";
import { tenantsKeys } from "../api/tenants.keys";

/**
 * Fetches the list of tenants this super-admin can manage, and defaults the
 * selected tenant to the first one returned the first time the list loads —
 * mirrors how `useMe` rehydrates `role` in auth.store as a side effect.
 */
export function useTenants() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);
  const setTenantSlug = useTenantStore((s) => s.setTenantSlug);

  const query = useSafeQuery({
    queryKey: tenantsKeys.lists(),
    queryFn: getTenants,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!tenantSlug && query.data && query.data.length > 0) {
      setTenantSlug(query.data[0].slug);
    }
  }, [tenantSlug, query.data, setTenantSlug]);

  return query;
}
