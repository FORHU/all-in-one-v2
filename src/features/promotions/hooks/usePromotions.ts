import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  searchPromotionTargets,
  type GetPromotionsParams,
  type PromotionWriteInput,
} from "../api/promotions.client";
import { promotionsKeys } from "../api/promotions.keys";

export function usePromotions(params: GetPromotionsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: promotionsKeys.list(tenantSlug, params),
    queryFn: () => getPromotions(params),
    enabled: Boolean(tenantSlug),
    // Keep the current page's rows visible while the next page loads instead
    // of flashing the skeleton.
    placeholderData: (prev) => prev,
  });
}

export function useCreatePromotion(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: PromotionWriteInput) => createPromotion(input),
    onValidationError: options?.onValidationError,
    onSuccess: (promotion) => {
      queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      notify.success(`Promotion "${promotion.title}" created.`);
    },
  });
}

export function useUpdatePromotion(
  id: string,
  options?: { onValidationError?: (fields: Record<string, string[]>) => void },
) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: Partial<PromotionWriteInput>) =>
      updatePromotion(id, input),
    onValidationError: options?.onValidationError,
    onSuccess: (promotion) => {
      queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      notify.success(`Promotion "${promotion.title}" updated.`);
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      notify.success("Promotion deleted.");
    },
  });
}

/**
 * Entity options for one "Applies to" row's picker. Pass an already-debounced
 * query. Runs for PRODUCT/COLLECTION once the query is long enough, and for
 * CATEGORY always (its list is fetched whole and filtered client-side).
 */
export function useTargetSearch(targetType: string, debouncedQuery: string) {
  return useSafeQuery({
    queryKey: [
      ...promotionsKeys.all,
      "target-search",
      targetType,
      debouncedQuery,
    ] as const,
    queryFn: () => searchPromotionTargets(targetType, debouncedQuery),
    enabled:
      targetType === "CATEGORY" ||
      ((targetType === "PRODUCT" || targetType === "COLLECTION") &&
        debouncedQuery.trim().length >= 2),
  });
}
