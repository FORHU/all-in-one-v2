import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  getTransactions,
  type GetTransactionsParams,
} from "../api/inventory.client";
import { inventoryKeys } from "../api/inventory.keys";

/** Audit trail of onHand changes (purchases, sales, returns, supplier syncs, manual adjustments). */
export function useTransactions(params: GetTransactionsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: inventoryKeys.transactionsList(tenantSlug, params),
    queryFn: () => getTransactions(params),
    enabled: Boolean(tenantSlug),
    placeholderData: (prev) => prev,
  });
}
