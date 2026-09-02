import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  applyPricingRuleToAll,
  type PricingRuleWriteInput,
} from "../api/pricing-rules.client";
import type { PricingRule } from "../contracts/pricing-rules.contract";
import { productsKeys } from "../api/products.keys";

export const pricingRulesKeys = {
  all: ["pricing-rules"] as const,
  // Tenant slug is part of the key — switching stores must not read
  // another store's cached rules out of react-query's cache.
  list: (tenantSlug: string | null) =>
    [...pricingRulesKeys.all, "list", tenantSlug] as const,
};

export function usePricingRules() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: pricingRulesKeys.list(tenantSlug),
    queryFn: () => getPricingRules(),
    enabled: Boolean(tenantSlug),
  });
}

export function useCreatePricingRule(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: PricingRuleWriteInput) => createPricingRule(input),
    onValidationError: options?.onValidationError,
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      notify.success(`Pricing rule "${rule.name}" created.`);
    },
  });
}

export function useUpdatePricingRule(
  id: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: Partial<PricingRuleWriteInput>) =>
      updatePricingRule(id, input),
    onValidationError: options?.onValidationError,
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      // A markup edit recalculates every product on this rule server-side —
      // refresh the products list so their prices don't look stale.
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Pricing rule "${rule.name}" updated.`);
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => deletePricingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      notify.success("Pricing rule deleted.");
    },
  });
}

/**
 * Force every product on a rule to be re-priced right now, without touching
 * the rule's config. Re-sends the rule's current markup / minimum profit /
 * sale, which the API treats as a change and so recalculates each product's
 * `price` / `salePrice` server-side. Use it when a sale window has opened or
 * closed since the last save — the backend does not sweep prices on a
 * schedule, only on write.
 */
export function useResyncPricingRulePrices() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (rule: PricingRule) =>
      updatePricingRule(rule.id, {
        markupValue: rule.markupValue,
        minimumProfit: rule.minimumProfit,
        sale: rule.sale
          ? {
              type: rule.sale.type,
              value: rule.sale.value,
              startsAt: rule.sale.startsAt,
              endsAt: rule.sale.endsAt,
            }
          : null,
      }),
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Prices re-synced for "${rule.name}".`);
    },
  });
}

/** Clears a rule's sale window immediately and re-prices its products. */
export function useEndPricingRuleSale() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => updatePricingRule(id, { sale: null }),
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Sale ended for "${rule.name}".`);
    },
  });
}

export function useApplyPricingRuleToAll() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => applyPricingRuleToAll(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: pricingRulesKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(
        `Applied to ${result.updatedCount} product${result.updatedCount === 1 ? "" : "s"}.`,
      );
    },
  });
}
