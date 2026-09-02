import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed against `PromotionDto` (all-in-one-v2-api's
 * promotion.service.ts): the service maps Prisma rows to plain JSON —
 * Decimal `value`/`maxDiscount` become numbers, `Date` fields become ISO
 * strings — so this contract reads those as `number` / `string`, not
 * Prisma's serialized-Decimal strings.
 *
 * The engine (promotion.engine.ts) only honours a subset of the rule /
 * reward types the schema allows; the unsupported ones are still valid to
 * store (the backend accepts them) but are marked here so the form can warn.
 */

export const PROMOTION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SCHEDULED",
  "EXPIRED",
  "DISABLED",
] as const;
export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export const RULE_TYPES = [
  "MIN_CART_TOTAL",
  "MIN_QUANTITY",
  "FIRST_ORDER",
  "CUSTOMER_GROUP",
] as const;
export type RuleType = (typeof RULE_TYPES)[number];
/** Rule types the checkout engine does not evaluate yet. */
export const UNSUPPORTED_RULE_TYPES: RuleType[] = ["CUSTOMER_GROUP"];

export const REWARD_TYPES = [
  "PERCENTAGE_OFF",
  "FIXED_AMOUNT_OFF",
  "FREE_SHIPPING",
  "BUY_X_GET_Y",
] as const;
export type RewardType = (typeof REWARD_TYPES)[number];
/** Reward types the checkout engine does not apply yet. */
export const UNSUPPORTED_REWARD_TYPES: RewardType[] = ["BUY_X_GET_Y"];

export const TARGET_TYPES = [
  "ALL",
  "PRODUCT",
  "VARIANT",
  "COLLECTION",
  "CATEGORY",
] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export const PromotionRuleSchema = z.object({
  id: z.string(),
  ruleType: z.string(),
  // Free-form per rule type — `{ minTotal }`, `{ minQty }`, `{}` — kept loose.
  condition: z.record(z.string(), z.unknown()).nullable().default({}),
});
export type PromotionRule = z.infer<typeof PromotionRuleSchema>;

export const PromotionRewardSchema = z.object({
  id: z.string(),
  rewardType: z.string(),
  value: z.number(),
  maxDiscount: z.number().nullable(),
});
export type PromotionReward = z.infer<typeof PromotionRewardSchema>;

export const PromotionTargetSchema = z.object({
  id: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
});
export type PromotionTarget = z.infer<typeof PromotionTargetSchema>;

export const PromotionSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(PROMOTION_STATUSES),
  priority: z.number(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  usageLimit: z.number().nullable(),
  usageCount: z.number(),
  rules: z.array(PromotionRuleSchema),
  rewards: z.array(PromotionRewardSchema),
  targets: z.array(PromotionTargetSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Promotion = z.infer<typeof PromotionSchema>;

/** GET /api/v2/promotions — the standard FAOS page envelope. */
export const PromotionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(PromotionSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type PromotionsPage = z.infer<typeof PromotionsResponseSchema>["data"];

/** POST/PUT /api/v2/promotions(/:id) — { status, statusCode, data: <promotion> }. */
export const PromotionResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: PromotionSchema,
});
