import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getOrders, type GetOrdersParams } from "../api/orders.client";
import { ordersKeys } from "../api/orders.keys";

export function useOrders(params: GetOrdersParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: ordersKeys.list(tenantSlug, params),
    queryFn: () => getOrders(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}
