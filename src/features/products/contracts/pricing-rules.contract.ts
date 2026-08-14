import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed against `PricingRuleDto`
 * (all-in-one-v2-api/src/modules/catalog/pricing-rule.service.ts). Only
 * PERCENTAGE markup is exposed by this admin UI today — the backend model
 * (CatalogPricingRule) also supports FIXED_AMOUNT and a per-rule
 * `isActive` toggle, but nothing here creates a rule of any other type or
 * flips it inactive, so those fields are intentionally left out of this
 * contract rather than modeled and unused.
 */
/**
 * A rule's optional time-boxed sale — computed on top of the already
 * marked-up price, not stored as a Postgres column (lives in Redis on the
 * backend, see pricing-rule-sale.store.ts). `isActive` is server-computed
 * from `startsAt`/`endsAt` against the current time, not something the
 * frontend derives itself.
 */
export const PricingRuleSaleSchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number(),
  startsAt: z.string(),
  endsAt: z.string(),
  isActive: z.boolean(),
});

export type PricingRuleSale = z.infer<typeof PricingRuleSaleSchema>;

export const PricingRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  markupValue: z.number(),
  minimumProfit: z.number().nullable(),
  isActive: z.boolean(),
  // The tenant's "apply to all products" rule — at most one true at a time.
  isDefault: z.boolean(),
  // How many products currently have this rule assigned — drives the
  // "in use, can't delete" guard in the UI.
  productCount: z.number(),
  sale: PricingRuleSaleSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PricingRule = z.infer<typeof PricingRuleSchema>;

/** GET /api/v2/pricing-rules */
export const PricingRulesResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(PricingRuleSchema),
  }),
});

/** POST/PUT /api/v2/pricing-rules(/:id) */
export const PricingRuleResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: PricingRuleSchema,
});

/** POST /api/v2/pricing-rules/:id/apply-to-all */
export const ApplyPricingRuleResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    updatedCount: z.number(),
  }),
});
