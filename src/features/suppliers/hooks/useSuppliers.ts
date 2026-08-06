import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getAvailableSuppliers } from "../api/suppliers.client";
import { suppliersKeys } from "../api/suppliers.keys";

export function useSuppliers() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: suppliersKeys.list(tenantSlug),
    queryFn: getAvailableSuppliers,
    enabled: Boolean(tenantSlug),
  });
}
