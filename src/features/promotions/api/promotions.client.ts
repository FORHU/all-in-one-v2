import { z } from "zod";
import { fetcher } from "@/shared/lib/http";
import {
  PromotionsResponseSchema,
  PromotionResponseSchema,
  type PromotionsPage,
  type PromotionStatus,
} from "../contracts/promotions.contract";

export type GetPromotionsParams = {
  status?: PromotionStatus;
  page?: number;
  limit?: number;
};

/** GET /api/v2/promotions — admin-only (catalog:read). Returns one page. */
export async function getPromotions(
  params: GetPromotionsParams = {},
): Promise<PromotionsPage> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  const raw = await fetcher<unknown>(`/api/v2/promotions${qs ? `?${qs}` : ""}`);
  return PromotionsResponseSchema.parse(raw).data;
}

export type PromotionRuleInput = {
  ruleType: string;
  condition: Record<string, unknown>;
};
export type PromotionRewardInput = {
  rewardType: string;
  value: number;
  maxDiscount?: number | null;
};
export type PromotionTargetInput = {
  targetType: string;
  targetId?: string | null;
};

export type PromotionWriteInput = {
  title: string;
  // `null` clears the code (makes it automatic); `undefined` leaves it as-is
  // on update. Same nullable-vs-optional convention as the collections client.
  code?: string | null;
  description?: string | null;
  status?: PromotionStatus;
  priority?: number;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  // Each of these, when present, fully replaces that child set server-side.
  rules?: PromotionRuleInput[];
  rewards?: PromotionRewardInput[];
  targets?: PromotionTargetInput[];
};

/** POST /api/v2/promotions — admin-only (catalog:write). */
export async function createPromotion(input: PromotionWriteInput) {
  const raw = await fetcher<unknown>("/api/v2/promotions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return PromotionResponseSchema.parse(raw).data;
}

/** PUT /api/v2/promotions/:id — admin-only (catalog:write). */
export async function updatePromotion(
  id: string,
  input: Partial<PromotionWriteInput>,
) {
  const raw = await fetcher<unknown>(`/api/v2/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return PromotionResponseSchema.parse(raw).data;
}

/** DELETE /api/v2/promotions/:id — admin-only (catalog:delete). Soft-deletes. */
export async function deletePromotion(id: string) {
  await fetcher<unknown>(`/api/v2/promotions/${id}`, { method: "DELETE" });
}

// ── Target entity search ────────────────────────────────────────────────────
// The "Applies to" editor needs to turn a name the operator types into an
// entity id. These hit the same admin endpoints the collections feature uses;
// responses are parsed loosely (only id + a display field are read).

export type TargetOption = { id: string; label: string };

const searchEnvelope = z.object({
  data: z.object({
    items: z.array(z.record(z.string(), z.unknown())),
  }),
});

function pickLabel(row: Record<string, unknown>): string {
  return (
    (typeof row.title === "string" && row.title) ||
    (typeof row.name === "string" && row.name) ||
    (typeof row.id === "string" && row.id) ||
    "Untitled"
  );
}

/**
 * Resolve a typed query to pickable {id,label} options for a PRODUCT,
 * COLLECTION or CATEGORY target. VARIANT has no search endpoint and is left
 * to a raw-id input. Categories have no server-side search param, so the
 * whole list is fetched once and filtered client-side.
 */
export async function searchPromotionTargets(
  targetType: string,
  query: string,
): Promise<TargetOption[]> {
  const q = query.trim();

  if (targetType === "PRODUCT") {
    const params = new URLSearchParams({ limit: "8" });
    if (q) params.set("search", q);
    const raw = await fetcher<unknown>(`/api/v2/products/admin?${params}`);
    return searchEnvelope
      .parse(raw)
      .data.items.map((r) => ({ id: String(r.id), label: pickLabel(r) }));
  }

  if (targetType === "COLLECTION") {
    const params = new URLSearchParams({ limit: "8" });
    if (q) params.set("search", q);
    const raw = await fetcher<unknown>(`/api/v2/collections?${params}`);
    return searchEnvelope
      .parse(raw)
      .data.items.map((r) => ({ id: String(r.id), label: pickLabel(r) }));
  }

  if (targetType === "CATEGORY") {
    const raw = await fetcher<unknown>(`/api/v2/categories?limit=100`);
    const all = searchEnvelope
      .parse(raw)
      .data.items.map((r) => ({ id: String(r.id), label: pickLabel(r) }));
    const lower = q.toLowerCase();
    return (
      lower ? all.filter((o) => o.label.toLowerCase().includes(lower)) : all
    ).slice(0, 12);
  }

  return [];
}
