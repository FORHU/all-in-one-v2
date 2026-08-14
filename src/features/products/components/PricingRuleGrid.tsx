"use client";

import { useEffect, useState } from "react";
import { Plus as PlusIcon, Star as StarIcon } from "lucide-react";
import {
  usePricingRules,
  useApplyPricingRuleToAll,
} from "../hooks/usePricingRules";
import { PricingRuleFormModal } from "./PricingRuleFormModal";
import type { PricingRule } from "../contracts/pricing-rules.contract";

export function PricingRuleGrid() {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern BrandGrid/CategoryGrid use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, error, refetch } = usePricingRules();
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [creating, setCreating] = useState(false);
  const {
    mutate: applyToAll,
    isPending: isApplying,
    variables: applyingId,
  } = useApplyPricingRuleToAll();

  if (!mounted || isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-2xl bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load pricing rules.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const rules = data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[var(--shop-text-muted)]">
          {rules.length} rule{rules.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--shop-ink)] px-3.5 py-2 text-[11px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)]"
        >
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          New pricing rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
          <p className="text-sm text-[var(--shop-text-muted)]">
            No pricing rules yet. Create one to start applying a markup
            percentage to your products.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-4 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5"
            >
              <button
                type="button"
                onClick={() => setEditing(rule)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--shop-text)]">
                    {rule.name}
                  </p>
                  {rule.isDefault && (
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-accent)]">
                      <StarIcon className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                  {rule.sale && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        color: rule.sale.isActive
                          ? "var(--shop-success)"
                          : "var(--shop-text-muted)",
                        backgroundColor: rule.sale.isActive
                          ? "var(--shop-success-bg)"
                          : "var(--shop-bg-soft)",
                      }}
                    >
                      {rule.sale.isActive ? "On sale" : "Sale scheduled"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--shop-text-muted)]">
                  {rule.markupValue}% markup · {rule.productCount} product
                  {rule.productCount === 1 ? "" : "s"}
                  {rule.minimumProfit != null &&
                    ` · min. profit $${rule.minimumProfit}`}
                  {rule.sale &&
                    ` · ${rule.sale.type === "PERCENTAGE" ? `${rule.sale.value}% off` : `$${rule.sale.value} off`}`}
                </p>
              </button>

              {!rule.isDefault && (
                <button
                  type="button"
                  onClick={() => applyToAll(rule.id)}
                  disabled={isApplying}
                  className="shrink-0 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isApplying && applyingId === rule.id
                    ? "Applying…"
                    : "Set as default & apply to all"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && <PricingRuleFormModal onClose={() => setCreating(false)} />}
      {editing && (
        <PricingRuleFormModal rule={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
