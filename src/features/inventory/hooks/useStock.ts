import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getVariantStock,
  setStock,
  searchProductsForStock,
  getProductVariantsForStock,
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

/** Debounce the query string before enabling this — see StockLookupView. */
export function useStockProductSearch(query: string) {
  return useSafeQuery({
    queryKey: [...inventoryKeys.all, "product-search", query] as const,
    queryFn: () => searchProductsForStock(query),
    enabled: query.trim().length >= 2,
  });
}

/** Only meaningful once a product is picked — `enabled` is false before that. */
export function useStockVariantOptions(productId: string) {
  return useSafeQuery({
    queryKey: [...inventoryKeys.all, "variant-options", productId] as const,
    queryFn: () => getProductVariantsForStock(productId),
    enabled: Boolean(productId),
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
