import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getCustomers, type GetCustomersParams } from "../api/customers.client";
import { customersKeys } from "../api/customers.keys";

export function useCustomers(params: GetCustomersParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: customersKeys.list(tenantSlug, params),
    queryFn: () => getCustomers(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}
