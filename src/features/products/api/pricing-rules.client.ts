import { fetcher } from "@/shared/lib/http";
import {
  PricingRulesResponseSchema,
  PricingRuleResponseSchema,
  ApplyPricingRuleResponseSchema,
} from "../contracts/pricing-rules.contract";

/** GET /api/v2/pricing-rules — admin-only (catalog:read). */
export const getPricingRules = async () => {
  const raw = await fetcher<unknown>("/api/v2/pricing-rules");
  return PricingRulesResponseSchema.parse(raw).data.items;
};

export type PricingRuleSaleWriteInput = {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt: string; // ISO
  endsAt: string; // ISO
};

export type PricingRuleWriteInput = {
  name: string;
  markupValue: number;
  minimumProfit?: number | null;
  // `undefined` = leave the sale as-is (update only). `null` = clear it.
  // An object = set/replace it.
  sale?: PricingRuleSaleWriteInput | null;
};

/** POST /api/v2/pricing-rules — admin-only (catalog:write). */
export const createPricingRule = async (input: PricingRuleWriteInput) => {
  const raw = await fetcher<unknown>("/api/v2/pricing-rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return PricingRuleResponseSchema.parse(raw).data;
};

/** PUT /api/v2/pricing-rules/:id — admin-only (catalog:write). */
export const updatePricingRule = async (
  id: string,
  input: Partial<PricingRuleWriteInput>,
) => {
  const raw = await fetcher<unknown>(`/api/v2/pricing-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return PricingRuleResponseSchema.parse(raw).data;
};

/** DELETE /api/v2/pricing-rules/:id — admin-only (catalog:delete). Blocked while any product still uses the rule. */
export const deletePricingRule = async (id: string) => {
  await fetcher<unknown>(`/api/v2/pricing-rules/${id}`, { method: "DELETE" });
};

/**
 * POST /api/v2/pricing-rules/:id/apply-to-all — admin-only (catalog:write).
 * Makes this the tenant's default rule and sweeps every product with no
 * explicit rule of its own (or still on the previous default) onto it,
 * recalculating their prices immediately.
 */
export const applyPricingRuleToAll = async (id: string) => {
  const raw = await fetcher<unknown>(
    `/api/v2/pricing-rules/${id}/apply-to-all`,
    {
      method: "POST",
    },
  );
  return ApplyPricingRuleResponseSchema.parse(raw).data;
};
