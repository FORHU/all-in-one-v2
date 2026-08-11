import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  getAdminProducts,
  type GetAdminProductsParams,
} from "../api/products.client";
import { productsKeys } from "../api/products.keys";

export function useAdminProducts(params: GetAdminProductsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: productsKeys.list(tenantSlug, params),
    queryFn: () => getAdminProducts(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}
