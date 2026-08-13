import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  getCategories,
  type GetCategoriesParams,
} from "../api/categories.client";
import { categoriesKeys } from "../api/categories.keys";

export function useCategories(params: GetCategoriesParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: categoriesKeys.list(tenantSlug, params),
    queryFn: () => getCategories(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}
