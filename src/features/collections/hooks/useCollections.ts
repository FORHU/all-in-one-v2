import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  getCollections,
  type GetCollectionsParams,
} from "../api/collections.client";
import { collectionsKeys } from "../api/collections.keys";

export function useCollections(params: GetCollectionsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: collectionsKeys.list(tenantSlug, params),
    queryFn: () => getCollections(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}
