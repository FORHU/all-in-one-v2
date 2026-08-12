import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getVariantStock,
  setStock,
  type SetStockInput,
} from "../api/inventory.client";
import { inventoryKeys } from "../api/inventory.keys";

/** Cross-location onHand/reserved/available rollup for one variant. */
export function useVariantStock(variantId: string) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: inventoryKeys.variantStock(tenantSlug, variantId),
    queryFn: () => getVariantStock(variantId),
    enabled: Boolean(tenantSlug) && Boolean(variantId),
  });
}

/** Upserts onHand (and optionally reorderPoint) for one variant at one location. */
export function useSetStock() {
  const queryClient = useQueryClient();
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeMutation({
    mutationFn: (input: SetStockInput) => setStock(input),
    onSuccess: (stock, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.variantStock(tenantSlug, variables.variantId),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.locationDetail(
          tenantSlug,
          variables.locationId,
        ),
      });
      notify.success(`Stock updated — ${stock.onHand} on hand.`);
    },
  });
}
