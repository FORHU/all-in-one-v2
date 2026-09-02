"use client";

import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import {
  Plus as PlusIcon,
  Tag as TagIcon,
  Zap as ZapIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import { usePromotions } from "../hooks/usePromotions";
import { PromotionFormModal } from "./PromotionFormModal";
import type {
  Promotion,
  PromotionReward,
} from "../contracts/promotions.contract";

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: "var(--shop-success)", bg: "var(--shop-success-bg)" },
  SCHEDULED: { color: "var(--shop-warning)", bg: "var(--shop-warning-bg)" },
  DRAFT: { color: "var(--shop-text-muted)", bg: "var(--shop-bg-soft)" },
  EXPIRED: { color: "var(--shop-text-muted)", bg: "var(--shop-bg-soft)" },
  DISABLED: { color: "var(--shop-danger)", bg: "var(--shop-danger-bg)" },
};

function rewardLabel(r: PromotionReward): string {
  switch (r.rewardType) {
    case "PERCENTAGE_OFF":
      return `${r.value}% off${r.maxDiscount != null ? ` (max $${r.maxDiscount})` : ""}`;
    case "FIXED_AMOUNT_OFF":
      return `$${r.value} off`;
    case "FREE_SHIPPING":
      return "Free shipping";
    case "BUY_X_GET_Y":
      return "Buy X get Y";
    default:
      return r.rewardType;
  }
}

function ruleLabel(
  ruleType: string,
  condition: Record<string, unknown> | null,
): string {
  const c = condition ?? {};
  switch (ruleType) {
    case "MIN_CART_TOTAL":
      return `Cart ≥ $${c.minTotal ?? "?"}`;
    case "MIN_QUANTITY":
      return `≥ ${c.minQty ?? "?"} items`;
    case "FIRST_ORDER":
      return "First order";
    case "CUSTOMER_GROUP":
      return "Customer group";
    default:
      return ruleType;
  }
}

function targetSummary(promotion: Promotion): string {
  const { targets } = promotion;
  if (targets.length === 0 || targets.some((t) => t.targetType === "ALL")) {
    return "the whole cart";
  }
  const counts = new Map<string, number>();
  targets.forEach((t) =>
    counts.set(t.targetType, (counts.get(t.targetType) ?? 0) + 1),
  );
  return [...counts.entries()]
    .map(([type, n]) => `${n} ${type.toLowerCase()}${n === 1 ? "" : "s"}`)
    .join(", ");
}

function windowLabel(p: Promotion): string {
  const fmt = (iso: string) => format(new Date(iso), "MMM d");
  if (p.startDate && p.endDate)
    return `${fmt(p.startDate)} – ${fmt(p.endDate)}`;
  if (p.startDate) return `from ${fmt(p.startDate)}`;
  if (p.endDate) return `until ${fmt(p.endDate)}`;
  return "always on";
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-[var(--shop-bg-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--shop-text-muted)]">
      {children}
    </span>
  );
}

function PromotionRow({
  promotion,
  onEdit,
}: {
  promotion: Promotion;
  onEdit: () => void;
}) {
  const style = STATUS_STYLE[promotion.status] ?? STATUS_STYLE.DRAFT;
  const reward =
    promotion.rewards.map(rewardLabel).join(" + ") || "No reward set";

  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex w-full items-center gap-3.5 rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-4 text-left transition hover:border-[var(--shop-accent)] hover:bg-[color-mix(in_srgb,var(--shop-accent)_4%,var(--shop-surface))]"
    >
      <span
        aria-hidden
        className="h-9 w-1 shrink-0 rounded-full"
        style={{ background: style.color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-[var(--shop-text)]">
            {promotion.title}
          </span>
          {promotion.code ? (
            <span className="flex items-center gap-1 rounded-full border border-[var(--shop-accent)]/30 bg-[color-mix(in_srgb,var(--shop-accent)_8%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-accent-dark)]">
              <TagIcon className="h-3 w-3" />
              {promotion.code}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-[var(--shop-bg-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              <ZapIcon className="h-3 w-3" />
              Automatic
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: style.color, backgroundColor: style.bg }}
          >
            {promotion.status.toLowerCase()}
          </span>
        </div>

        <p className="mt-1 text-[13px] text-[var(--shop-text-muted)]">
          <span className="font-semibold text-[var(--shop-text)]">
            {reward}
          </span>{" "}
          on {targetSummary(promotion)}
        </p>

        {promotion.rules.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {promotion.rules.map((r) => (
              <Chip key={r.id}>{ruleLabel(r.ruleType, r.condition)}</Chip>
            ))}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-0.5 text-right sm:flex">
        <span className="text-xs font-semibold tabular-nums text-[var(--shop-text)]">
          {promotion.usageCount}
          {promotion.usageLimit != null ? ` / ${promotion.usageLimit}` : ""}
          <span className="font-normal text-[var(--shop-text-muted)]">
            {" "}
            used
          </span>
        </span>
        <span className="text-[11px] text-[var(--shop-text-muted)]">
          {windowLabel(promotion)}
        </span>
        {promotion.priority > 0 && (
          <span className="text-[11px] text-[var(--shop-text-muted)]">
            priority {promotion.priority}
          </span>
        )}
      </div>

      <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--shop-text-muted)] opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

export function PromotionsView() {
  // usePromotions is gated on tenantSlug, which reads localStorage — the
  // server always sees it empty. Gate the first client paint on `mounted` so
  // it renders the same skeleton the server did (same pattern as
  // PricingRuleGrid), avoiding a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const {
    data: pageData,
    isLoading,
    isFetching,
    error,
  } = usePromotions({ page, limit: PAGE_SIZE });
  const promotions = pageData?.items;

  // Snap back if the current page no longer exists (e.g. after deleting the
  // last row on the last page).
  useEffect(() => {
    if (pageData && pageData.totalPages >= 1 && page > pageData.totalPages) {
      setPage(pageData.totalPages);
    }
  }, [pageData, page]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="shop-display text-xl font-semibold text-[var(--shop-text)]">
            Promotions
          </h1>
          <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
            Discount campaigns applied at checkout — automatically, or when a
            shopper enters a code.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--shop-ink)] px-3 py-2 text-xs font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)]"
        >
          <PlusIcon className="h-4 w-4" />
          New promotion
        </button>
      </div>

      {!mounted || isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[76px] animate-pulse rounded-xl border border-[var(--shop-border)] bg-[var(--shop-bg-soft)]"
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-5 text-xs font-semibold text-[var(--shop-danger)]">
          Couldn&apos;t load promotions.
        </p>
      ) : !promotions || promotions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--shop-border)] p-10 text-center">
          <p className="text-sm font-semibold text-[var(--shop-text)]">
            No promotions yet
          </p>
          <p className="mt-1 text-xs text-[var(--shop-text-muted)]">
            Create one to run an automatic sale or a promo code.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {promotions.map((promotion) => (
              <PromotionRow
                key={promotion.id}
                promotion={promotion}
                onEdit={() => setEditing(promotion)}
              />
            ))}
          </div>
          <p className="mt-4 text-[11px] text-[var(--shop-text-muted)]">
            {pageData.total} promotion{pageData.total === 1 ? "" : "s"}
          </p>
          <Pagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      )}

      {creating && <PromotionFormModal onClose={() => setCreating(false)} />}
      {editing && (
        <PromotionFormModal
          key={editing.id}
          promotion={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
