"use client";

import { Dropdown } from "@/shared/components/Dropdown";
import { PromotionSectionPanel, PromotionRow } from "./PromotionSectionPanel";
import {
  RULE_OPTIONS,
  inputClass,
  isUnsupportedRule,
  makeRowKey,
  type RuleDraft,
} from "./promotion-form-model";

type Props = {
  rows: RuleDraft[];
  errors: Record<string, string>;
  disabled?: boolean;
  onChange: (rows: RuleDraft[]) => void;
};

export function PromotionRulesEditor({
  rows,
  errors,
  disabled,
  onChange,
}: Props) {
  const patch = (key: string, next: Partial<RuleDraft>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...next } : r)));

  return (
    <PromotionSectionPanel
      title="Qualifying rules"
      hint="All rules must pass for the promotion to apply. No rules = always qualifies."
      addLabel="Add rule"
      onAdd={() =>
        onChange([
          ...rows,
          {
            key: makeRowKey(),
            ruleType: "MIN_CART_TOTAL",
            minTotal: "",
            minQty: "",
          },
        ])
      }
    >
      {rows.length === 0 && (
        <p className="text-[10.5px] italic text-[var(--shop-text-muted)]">
          No rules — applies whenever it&apos;s active.
        </p>
      )}
      {rows.map((row) => (
        <PromotionRow
          key={row.key}
          onRemove={() => onChange(rows.filter((r) => r.key !== row.key))}
          removeLabel="Remove rule"
          error={errors[row.key]}
          warning={
            isUnsupportedRule(row.ruleType)
              ? "Not checked at checkout yet — a promo relying on this will never apply."
              : undefined
          }
        >
          <label className="sr-only" htmlFor={`rule-type-${row.key}`}>
            Rule type
          </label>
          <Dropdown
            value={row.ruleType}
            options={RULE_OPTIONS}
            disabled={disabled}
            aria-label="Rule type"
            onChange={(v) => patch(row.key, { ruleType: v })}
          />
          {row.ruleType === "MIN_CART_TOTAL" && (
            <>
              <label className="sr-only" htmlFor={`rule-mintotal-${row.key}`}>
                Minimum cart total in dollars
              </label>
              <input
                id={`rule-mintotal-${row.key}`}
                value={row.minTotal}
                onChange={(e) => patch(row.key, { minTotal: e.target.value })}
                placeholder="Min cart total ($)"
                inputMode="decimal"
                disabled={disabled}
                className={inputClass}
              />
            </>
          )}
          {row.ruleType === "MIN_QUANTITY" && (
            <>
              <label className="sr-only" htmlFor={`rule-minqty-${row.key}`}>
                Minimum item quantity
              </label>
              <input
                id={`rule-minqty-${row.key}`}
                value={row.minQty}
                onChange={(e) => patch(row.key, { minQty: e.target.value })}
                placeholder="Min item quantity"
                inputMode="numeric"
                disabled={disabled}
                className={inputClass}
              />
            </>
          )}
          {row.ruleType === "FIRST_ORDER" && (
            <p className="text-[10.5px] text-[var(--shop-text-muted)]">
              Applies only to a customer&apos;s first order.
            </p>
          )}
        </PromotionRow>
      ))}
    </PromotionSectionPanel>
  );
}
