import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getCategoryBySlug } from "../api/categories.client";
import { categoriesKeys } from "../api/categories.keys";

export function useCategory(slug: string) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: categoriesKeys.detail(tenantSlug, slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: Boolean(tenantSlug) && Boolean(slug),
  });
}
