import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getCollections } from "../api/collections.client";
import { collectionsKeys } from "../api/collections.keys";

export function useCollections() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: collectionsKeys.list(tenantSlug),
    queryFn: getCollections,
    enabled: Boolean(tenantSlug),
  });
}
