import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getCategories } from "../api/categories.client";
import { categoriesKeys } from "../api/categories.keys";

export function useCategories() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: categoriesKeys.list(tenantSlug),
    queryFn: getCategories,
    enabled: Boolean(tenantSlug),
  });
}
