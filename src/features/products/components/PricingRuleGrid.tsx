"use client";

import { useEffect, useState } from "react";
import {
  Plus as PlusIcon,
  Star as StarIcon,
  RefreshCw as RefreshIcon,
  AlertTriangle as AlertIcon,
} from "lucide-react";
import {
  usePricingRules,
  useApplyPricingRuleToAll,
  useResyncPricingRulePrices,
  useEndPricingRuleSale,
} from "../hooks/usePricingRules";
import { PricingRuleFormModal } from "./PricingRuleFormModal";
import type { PricingRule } from "../contracts/pricing-rules.contract";

type PricingRuleGridProps = {
  /** Rendered inline with the rule count/Add button instead of its own
   * stacked row above it — see CollectionGrid's identically-named prop. No
   * `subtitle` here (unlike that one): title + rule count + button already
   * fill the row: a full sentence alongside them would overflow it. */
  heading?: { title: string };
};

type SaleState = {
  /** "live" = window open now · "scheduled" = starts later · "ended" = window closed */
  phase: "live" | "scheduled" | "ended";
  /** Set when product prices were last recalculated before the window crossed
   * a boundary, so what customers see no longer matches the rule. */
  staleReason: string | null;
};

/**
 * Works out a sale's phase and whether product prices have drifted from it.
 * The API only re-prices products on write, never on a timer, so a window that
 * opens or closes after the last save leaves `salePrice` wrong until someone
 * re-syncs. `updatedAt` is our proxy for "last time this rule re-priced".
 */
function readSaleState(rule: PricingRule): SaleState | null {
  if (!rule.sale) return null;

  const now = Date.now();
  const start = new Date(rule.sale.startsAt).getTime();
  const end = new Date(rule.sale.endsAt).getTime();
  const lastSync = new Date(rule.updatedAt).getTime();

  const phase: SaleState["phase"] =
    now > end ? "ended" : now >= start ? "live" : "scheduled";

  let staleReason: string | null = null;
  if (rule.productCount > 0) {
    if (phase === "live" && start > lastSync) {
      staleReason =
        "Sale is live, but these products were last priced before it started — re-sync to apply it.";
    } else if (phase === "ended" && end > lastSync) {
      staleReason =
        "Sale has ended, but these products were last priced while it ran — re-sync to drop it.";
    }
  }

  return { phase, staleReason };
}

function PricingRuleRow({
  rule,
  onEdit,
  confirmingEndSale,
  onRequestEndSale,
  onCancelEndSale,
}: {
  rule: PricingRule;
  onEdit: () => void;
  confirmingEndSale: boolean;
  onRequestEndSale: () => void;
  onCancelEndSale: () => void;
}) {
  const {
    mutate: applyToAll,
    isPending: isApplying,
    variables: applyingId,
  } = useApplyPricingRuleToAll();
  const { mutate: resync, isPending: isResyncing } =
    useResyncPricingRulePrices();
  const { mutate: endSale, isPending: isEndingSale } = useEndPricingRuleSale();

  const busy = isApplying || isResyncing || isEndingSale;
  const sale = readSaleState(rule);

  const saleLabel =
    sale?.phase === "live"
      ? "On sale"
      : sale?.phase === "scheduled"
        ? "Sale scheduled"
        : sale?.phase === "ended"
          ? "Sale ended"
          : null;

  return (
    <div className="rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[var(--shop-text)]">
              {rule.name}
            </p>
            {rule.isDefault && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-accent)]">
                <StarIcon className="h-3 w-3 fill-current" />
                Default
              </span>
            )}
            {saleLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color:
                    sale!.phase === "live"
                      ? "var(--shop-success)"
                      : "var(--shop-text-muted)",
                  backgroundColor:
                    sale!.phase === "live"
                      ? "var(--shop-success-bg)"
                      : "var(--shop-bg-soft)",
                }}
              >
                {saleLabel}
              </span>
            )}
            {sale?.staleReason && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--shop-danger-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-danger)]">
                <AlertIcon className="h-3 w-3" />
                Prices stale
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--shop-text-muted)]">
            {rule.markupValue}% markup · {rule.productCount} product
            {rule.productCount === 1 ? "" : "s"}
            {rule.minimumProfit != null &&
              ` · min. profit $${rule.minimumProfit}`}
            {rule.sale &&
              ` · ${
                rule.sale.type === "PERCENTAGE"
                  ? `${rule.sale.value}% off`
                  : `$${rule.sale.value} off`
              }${sale?.phase === "live" ? " (applies to all above)" : ""}`}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {rule.sale && rule.productCount > 0 && (
            <button
              type="button"
              onClick={() => resync(rule)}
              disabled={busy}
              title="Re-price every product on this rule against the sale window right now"
              className={[
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-40",
                sale?.staleReason
                  ? "border-[var(--shop-danger)]/40 bg-[var(--shop-danger-bg)] text-[var(--shop-danger)] hover:brightness-95"
                  : "border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-text)] hover:bg-[var(--shop-bg)]",
              ].join(" ")}
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 ${isResyncing ? "animate-spin" : ""}`}
              />
              {isResyncing ? "Re-syncing…" : "Re-sync prices"}
            </button>
          )}

          {rule.sale && sale?.phase !== "ended" && (
            <button
              type="button"
              onClick={
                confirmingEndSale ? () => endSale(rule.id) : onRequestEndSale
              }
              onBlur={onCancelEndSale}
              disabled={busy}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEndingSale
                ? "Ending…"
                : confirmingEndSale
                  ? "End sale — confirm?"
                  : "End sale now"}
            </button>
          )}

          {!rule.isDefault && (
            <button
              type="button"
              onClick={() => applyToAll(rule.id)}
              disabled={busy}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isApplying && applyingId === rule.id
                ? "Applying…"
                : "Set as default & apply to all"}
            </button>
          )}
        </div>
      </div>

      {sale?.staleReason && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--shop-danger-bg)] px-3 py-2 text-[11px] font-medium text-[var(--shop-danger)]">
          <AlertIcon className="mt-px h-3.5 w-3.5 shrink-0" />
          {sale.staleReason}
        </p>
      )}
    </div>
  );
}

export function PricingRuleGrid({ heading }: PricingRuleGridProps = {}) {
  // tenantSlug (and therefore this query) reads localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern BrandGrid/CategoryGrid use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, error, refetch } = usePricingRules();
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmingEndSaleId, setConfirmingEndSaleId] = useState<string | null>(
    null,
  );

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="mr-auto flex items-baseline gap-3">
          {heading && (
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {heading.title}
            </h2>
          )}
          <p className="text-xs text-[var(--shop-text-muted)]">
            {rules.length} rule{rules.length === 1 ? "" : "s"}
          </p>
        </div>
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
            <PricingRuleRow
              key={rule.id}
              rule={rule}
              onEdit={() => setEditing(rule)}
              confirmingEndSale={confirmingEndSaleId === rule.id}
              onRequestEndSale={() => setConfirmingEndSaleId(rule.id)}
              onCancelEndSale={() =>
                setConfirmingEndSaleId((id) => (id === rule.id ? null : id))
              }
            />
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
