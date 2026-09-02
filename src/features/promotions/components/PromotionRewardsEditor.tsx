"use client";

import { Dropdown } from "@/shared/components/Dropdown";
import { PromotionSectionPanel, PromotionRow } from "./PromotionSectionPanel";
import {
  REWARD_OPTIONS,
  inputClass,
  isUnsupportedReward,
  makeRowKey,
  type RewardDraft,
} from "./promotion-form-model";

type Props = {
  rows: RewardDraft[];
  errors: Record<string, string>;
  disabled?: boolean;
  onChange: (rows: RewardDraft[]) => void;
};

export function PromotionRewardsEditor({
  rows,
  errors,
  disabled,
  onChange,
}: Props) {
  const patch = (key: string, next: Partial<RewardDraft>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...next } : r)));

  return (
    <PromotionSectionPanel
      title="Rewards"
      hint="What the customer gets. Percentages and fixed amounts apply to the targeted line items below."
      addLabel="Add reward"
      onAdd={() =>
        onChange([
          ...rows,
          {
            key: makeRowKey(),
            rewardType: "PERCENTAGE_OFF",
            value: "",
            maxDiscount: "",
          },
        ])
      }
    >
      {rows.map((row) => (
        <PromotionRow
          key={row.key}
          onRemove={() => onChange(rows.filter((r) => r.key !== row.key))}
          removeLabel="Remove reward"
          removeDisabled={rows.length === 1}
          error={errors[row.key]}
          warning={
            isUnsupportedReward(row.rewardType)
              ? "Buy-X-get-Y isn't applied at checkout yet."
              : undefined
          }
        >
          <label className="sr-only" htmlFor={`reward-type-${row.key}`}>
            Reward type
          </label>
          <Dropdown
            value={row.rewardType}
            options={REWARD_OPTIONS}
            disabled={disabled}
            aria-label="Reward type"
            onChange={(v) => patch(row.key, { rewardType: v })}
          />
          {row.rewardType !== "FREE_SHIPPING" && (
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="sr-only" htmlFor={`reward-value-${row.key}`}>
                  {row.rewardType === "PERCENTAGE_OFF"
                    ? "Percent off"
                    : "Amount off in dollars"}
                </label>
                <input
                  id={`reward-value-${row.key}`}
                  value={row.value}
                  onChange={(e) => patch(row.key, { value: e.target.value })}
                  placeholder={
                    row.rewardType === "PERCENTAGE_OFF" ? "% off" : "$ off"
                  }
                  inputMode="decimal"
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
              {row.rewardType === "PERCENTAGE_OFF" && (
                <div className="flex-1">
                  <label className="sr-only" htmlFor={`reward-max-${row.key}`}>
                    Maximum discount in dollars
                  </label>
                  <input
                    id={`reward-max-${row.key}`}
                    value={row.maxDiscount}
                    onChange={(e) =>
                      patch(row.key, { maxDiscount: e.target.value })
                    }
                    placeholder="Max $ (optional)"
                    inputMode="decimal"
                    disabled={disabled}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}
          {row.rewardType === "FREE_SHIPPING" && (
            <p className="text-[10.5px] text-[var(--shop-text-muted)]">
              Waives the shipping charge. Recorded now; takes effect once
              shipping is priced.
            </p>
          )}
        </PromotionRow>
      ))}
    </PromotionSectionPanel>
  );
}
