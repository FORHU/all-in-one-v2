import type { DropdownOption } from "@/shared/components/Dropdown";
import {
  PROMOTION_STATUSES,
  RULE_TYPES,
  REWARD_TYPES,
  TARGET_TYPES,
  UNSUPPORTED_RULE_TYPES,
  UNSUPPORTED_REWARD_TYPES,
  type Promotion,
} from "../contracts/promotions.contract";
import type { PromotionWriteInput } from "../api/promotions.client";

export const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 text-xs text-[var(--shop-text)] outline-none transition focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/25 disabled:opacity-50";

export const labelClass =
  "mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

export const hintClass =
  "mt-0.5 text-[10px] leading-snug text-[var(--shop-text-muted)]";

export const fieldErrorClass =
  "mt-1 flex items-start gap-1 text-[10.5px] font-semibold text-[var(--shop-danger)]";

// "MIN_CART_TOTAL" -> "Min cart total"
function humanize(value: string): string {
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const STATUS_OPTIONS: DropdownOption[] = PROMOTION_STATUSES.map((s) => ({
  value: s,
  label: humanize(s),
}));
export const RULE_OPTIONS: DropdownOption[] = RULE_TYPES.map((r) => ({
  value: r,
  label: humanize(r),
}));
export const REWARD_OPTIONS: DropdownOption[] = REWARD_TYPES.map((r) => ({
  value: r,
  label: r === "BUY_X_GET_Y" ? "Buy X get Y" : humanize(r),
}));
export const TARGET_OPTIONS: DropdownOption[] = TARGET_TYPES.map((t) => ({
  value: t,
  label: t === "ALL" ? "Whole cart" : humanize(t),
}));

export const isUnsupportedRule = (t: string) =>
  (UNSUPPORTED_RULE_TYPES as string[]).includes(t);
export const isUnsupportedReward = (t: string) =>
  (UNSUPPORTED_REWARD_TYPES as string[]).includes(t);

// ── Draft row shapes ───────────────────────────────────────────────────────
// A stable `key` per row (not the array index) so React reconciles the right
// input values when a middle row is removed.

let rowKeySeq = 0;
export const makeRowKey = () => `row-${++rowKeySeq}`;

export type RuleDraft = {
  key: string;
  ruleType: string;
  minTotal: string;
  minQty: string;
};
export type RewardDraft = {
  key: string;
  rewardType: string;
  value: string;
  maxDiscount: string;
};
export type TargetDraft = {
  key: string;
  targetType: string;
  targetId: string;
  /** Display-only label for an already-picked entity; never sent to the API. */
  targetLabel: string;
};

export type IdentityDraft = {
  title: string;
  code: string;
  description: string;
  status: string;
  priority: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
};

export type PromotionDraft = {
  identity: IdentityDraft;
  rules: RuleDraft[];
  rewards: RewardDraft[];
  targets: TargetDraft[];
};

export function seedDraft(promotion?: Promotion): PromotionDraft {
  return {
    identity: {
      title: promotion?.title ?? "",
      code: promotion?.code ?? "",
      description: promotion?.description ?? "",
      status: promotion?.status ?? "DRAFT",
      priority: promotion ? String(promotion.priority) : "0",
      usageLimit:
        promotion?.usageLimit != null ? String(promotion.usageLimit) : "",
      startDate: promotion?.startDate ?? "",
      endDate: promotion?.endDate ?? "",
    },
    rules: (promotion?.rules ?? []).map((r) => {
      const c = (r.condition ?? {}) as Record<string, unknown>;
      return {
        key: makeRowKey(),
        ruleType: r.ruleType,
        minTotal: c.minTotal != null ? String(c.minTotal) : "",
        minQty: c.minQty != null ? String(c.minQty) : "",
      };
    }),
    rewards:
      promotion && promotion.rewards.length > 0
        ? promotion.rewards.map((r) => ({
            key: makeRowKey(),
            rewardType: r.rewardType,
            value: String(r.value),
            maxDiscount: r.maxDiscount != null ? String(r.maxDiscount) : "",
          }))
        : [
            {
              key: makeRowKey(),
              rewardType: "PERCENTAGE_OFF",
              value: "",
              maxDiscount: "",
            },
          ],
    targets:
      promotion && promotion.targets.length > 0
        ? promotion.targets.map((t) => ({
            key: makeRowKey(),
            targetType: t.targetType,
            targetId: t.targetId ?? "",
            targetLabel: t.targetId ?? "",
          }))
        : [
            {
              key: makeRowKey(),
              targetType: "ALL",
              targetId: "",
              targetLabel: "",
            },
          ],
  };
}

/** Cheap structural signature for dirty-checking (order-sensitive, which is fine). */
export function draftSignature(d: PromotionDraft): string {
  return JSON.stringify({
    i: d.identity,
    r: d.rules.map(({ key: _k, ...x }) => x),
    w: d.rewards.map(({ key: _k, ...x }) => x),
    t: d.targets.map(({ key: _k, targetLabel: _l, ...x }) => x),
  });
}

export type ValidationResult = {
  input: PromotionWriteInput | null;
  fieldErrors: Record<string, string>;
  rowErrors: Record<string, string>;
};

function nonNegNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Turns a draft into an API payload, or returns per-field / per-row errors.
 * Numbers are never silently coerced — a non-numeric or negative entry is an
 * error, not a `0`.
 */
export function validateDraft(d: PromotionDraft): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const rowErrors: Record<string, string> = {};
  const { identity: id } = d;

  if (!id.title.trim()) fieldErrors.title = "Give the promotion a title.";
  if (id.title.length > 200)
    fieldErrors.title = "Keep the title under 200 characters.";
  if (id.code.length > 60)
    fieldErrors.code = "Codes are at most 60 characters.";
  if (id.description.length > 2000)
    fieldErrors.description = "Keep the description under 2000 characters.";

  if (id.priority.trim() !== "" && nonNegNumber(id.priority) === null)
    fieldErrors.priority = "Priority must be a number (0 or more).";
  if (id.usageLimit.trim() !== "") {
    const n = nonNegNumber(id.usageLimit);
    if (n === null || !Number.isInteger(n) || n < 1)
      fieldErrors.usageLimit =
        "Usage limit must be a whole number of 1 or more.";
  }
  if (
    id.startDate &&
    id.endDate &&
    new Date(id.endDate) <= new Date(id.startDate)
  )
    fieldErrors.endDate = "End must be after the start.";

  const rules = d.rules
    .filter((r) => r.ruleType)
    .map((r) => {
      let condition: Record<string, unknown> = {};
      if (r.ruleType === "MIN_CART_TOTAL") {
        const n = nonNegNumber(r.minTotal);
        if (n === null) rowErrors[r.key] = "Enter a minimum cart total.";
        condition = { minTotal: n ?? 0 };
      } else if (r.ruleType === "MIN_QUANTITY") {
        const n = nonNegNumber(r.minQty);
        if (n === null || !Number.isInteger(n) || n < 1)
          rowErrors[r.key] = "Enter a whole minimum quantity.";
        condition = { minQty: n ?? 0 };
      }
      return { ruleType: r.ruleType, condition };
    });

  const rewards = d.rewards
    .filter((r) => r.rewardType)
    .map((r) => {
      let value = 0;
      if (r.rewardType !== "FREE_SHIPPING") {
        const n = nonNegNumber(r.value);
        if (n === null) rowErrors[r.key] = "Enter the discount amount.";
        else if (r.rewardType === "PERCENTAGE_OFF" && n > 100)
          rowErrors[r.key] = "A percentage can't exceed 100.";
        value = n ?? 0;
      }
      let maxDiscount: number | null = null;
      if (r.rewardType === "PERCENTAGE_OFF" && r.maxDiscount.trim() !== "") {
        const m = nonNegNumber(r.maxDiscount);
        if (m === null) rowErrors[r.key] = "Max discount must be a number.";
        else maxDiscount = m;
      }
      return { rewardType: r.rewardType, value, maxDiscount };
    });
  if (rewards.length === 0) fieldErrors.rewards = "Add at least one reward.";

  const targets = d.targets
    .filter((t) => t.targetType)
    .map((t) => {
      const targetId =
        t.targetType === "ALL" ? null : t.targetId.trim() || null;
      if (t.targetType !== "ALL" && !targetId)
        rowErrors[t.key] = `Pick a ${t.targetType.toLowerCase()}.`;
      return { targetType: t.targetType, targetId };
    });

  if (
    Object.keys(fieldErrors).length > 0 ||
    Object.keys(rowErrors).length > 0
  ) {
    return { input: null, fieldErrors, rowErrors };
  }

  return {
    input: {
      title: id.title.trim(),
      code: id.code.trim() ? id.code.trim() : null,
      description: id.description.trim() ? id.description.trim() : null,
      status: id.status as PromotionWriteInput["status"],
      priority: nonNegNumber(id.priority) ?? 0,
      usageLimit: id.usageLimit.trim() !== "" ? Number(id.usageLimit) : null,
      startDate: id.startDate || null,
      endDate: id.endDate || null,
      rules,
      rewards,
      targets,
    },
    fieldErrors,
    rowErrors,
  };
}
