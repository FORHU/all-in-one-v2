import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getSyncJobs, getSyncLogs } from "../api/suppliers.client";
import { suppliersKeys } from "../api/suppliers.keys";

export function useSyncJobs(params: { page: number; limit: number }) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: suppliersKeys.syncJobs.list(
      tenantSlug,
      params.page,
      params.limit,
    ),
    queryFn: () => getSyncJobs(params),
    enabled: Boolean(tenantSlug),
  });
}

/** Only fires once a row is expanded — logs aren't needed until the user asks for them. */
export function useSyncLogs(jobId: string, enabled: boolean) {
  return useSafeQuery({
    queryKey: suppliersKeys.syncJobs.logs(jobId),
    queryFn: () => getSyncLogs(jobId),
    enabled: enabled && Boolean(jobId),
  });
}
