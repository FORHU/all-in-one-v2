import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getReturns, type GetReturnsParams } from "../api/returns.client";
import { returnsKeys } from "../api/returns.keys";

export function useReturns(params: GetReturnsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: returnsKeys.list(tenantSlug, params),
    queryFn: () => getReturns(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}
