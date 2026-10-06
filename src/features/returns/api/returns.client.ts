import { fetcher } from "@/shared/lib/http";
import {
  ReturnsResponseSchema,
  ReturnsByOrderResponseSchema,
  ReturnMutationResponseSchema,
  IssueRefundResponseSchema,
  CreateReturnResponseSchema,
  ReturnDetailResponseSchema,
  ReturnTransitionResponseSchema,
  FileCjDisputeResponseSchema,
  RefreshCjDisputeResponseSchema,
  type ReturnStatus,
} from "../contracts/returns.contract";

export type GetReturnsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
  // "CUSTOMER_RESPONDED" is a derived pseudo-status (not a real
  // ReturnStatus) that the backend controller special-cases — see
  // ReturnsListView.tsx's CUSTOMER_RESPONDED constant.
  status?: ReturnStatus | "CUSTOMER_RESPONDED";
};

/** GET /api/v2/returns — admin-only, requires x-tenant-slug (attached by http.ts). */
export const getReturns = async (params: GetReturnsParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/returns${qs ? `?${qs}` : ""}`);
  return ReturnsResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};

/** GET /api/v2/returns/order/:orderId — every return filed against one order. */
export const getReturnsByOrder = async (orderId: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/order/${orderId}`);
  return ReturnsByOrderResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/returns/:id/approve — PENDING only, moves to APPROVED. */
export const approveReturn = async (id: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/approve`, {
    method: "PATCH",
  });
  return ReturnMutationResponseSchema.parse(raw).data;
};

export type RejectReturnInput = { notes?: string };

/** PATCH /api/v2/returns/:id/reject — PENDING only, moves to REJECTED. */
export const rejectReturn = async (
  id: string,
  input: RejectReturnInput = {},
) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return ReturnMutationResponseSchema.parse(raw).data;
};

export type IssueRefundInput = { amount: number; reason?: string };

/** POST /api/v2/returns/:returnId/refund — APPROVED only. Issues a real Stripe refund. */
export const issueReturnRefund = async (
  returnId: string,
  orderId: string,
  input: IssueRefundInput,
) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${returnId}/refund`, {
    method: "POST",
    body: JSON.stringify({ orderId, ...input }),
  });
  return IssueRefundResponseSchema.parse(raw).data;
};

/** GET /api/v2/returns/:id/detail — full admin review screen. */
export const getReturnDetail = async (id: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/detail`);
  return ReturnDetailResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/returns/:id/status/under-review — PENDING -> UNDER_REVIEW. */
export const startReturnReview = async (id: string) => {
  const raw = await fetcher<unknown>(
    `/api/v2/returns/${id}/status/under-review`,
    {
      method: "PATCH",
    },
  );
  return ReturnTransitionResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/returns/:id/status/evidence-required — UNDER_REVIEW -> EVIDENCE_REQUIRED. */
export const requestReturnEvidence = async (id: string, note: string) => {
  const raw = await fetcher<unknown>(
    `/api/v2/returns/${id}/status/evidence-required`,
    {
      method: "PATCH",
      body: JSON.stringify({ note }),
    },
  );
  return ReturnTransitionResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/returns/:id/status/approve — UNDER_REVIEW -> APPROVED (new request lifecycle, not the legacy PENDING-only approveReturn). */
export const approveReturnRequest = async (id: string, note?: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/status/approve`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
  return ReturnTransitionResponseSchema.parse(raw).data;
};

/** PATCH /api/v2/returns/:id/status/reject — UNDER_REVIEW or EVIDENCE_REQUIRED -> REJECTED (new request lifecycle). */
export const rejectReturnRequest = async (id: string, reason: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/status/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return ReturnTransitionResponseSchema.parse(raw).data;
};

/**
 * POST /api/v2/returns/:id/dispute/file — admin tries to recover
 * AddictStyle's cost from CJ before ever refunding the customer.
 */
export const fileCjDispute = async (id: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/dispute/file`, {
    method: "POST",
  });
  return FileCjDisputeResponseSchema.parse(raw).data;
};

/** GET /api/v2/returns/:id/dispute/refresh — on-demand pull of CJ's current ruling, never auto-transitions status. */
export const refreshCjDispute = async (id: string) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/dispute/refresh`);
  return RefreshCjDisputeResponseSchema.parse(raw).data;
};

/** POST /api/v2/returns/:id/dispute/confirm-outcome — admin confirms what CJ's raw status actually means. */
export const confirmCjDisputeOutcome = async (
  id: string,
  outcome: "APPROVED" | "REJECTED",
  note?: string,
) => {
  const raw = await fetcher<unknown>(
    `/api/v2/returns/${id}/dispute/confirm-outcome`,
    {
      method: "POST",
      body: JSON.stringify({ outcome, note }),
    },
  );
  return ReturnTransitionResponseSchema.parse(raw).data;
};

export type ProcessRefundInput = {
  amount: number;
  note?: string;
  costCoveredBy?: "CJ" | "ADDICTSTYLE" | "CUSTOMER_NOT_REFUNDED" | "SPLIT";
};

/**
 * POST /api/v2/returns/:id/process-refund — the actual refund, callable
 * from APPROVED/CJ_APPROVED/CJ_REJECTED/RETURN_PROCESSING. Distinct from
 * the legacy issueRefund (POST /:returnId/refund) above, which only ever
 * worked from plain APPROVED and records no cost-attribution bookkeeping.
 */
export const processRefund = async (id: string, input: ProcessRefundInput) => {
  const raw = await fetcher<unknown>(`/api/v2/returns/${id}/process-refund`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return ReturnTransitionResponseSchema.parse(raw).data;
};

export type CreateReturnInput = {
  orderId: string;
  customerId: string;
  reason: string;
  notes?: string;
};

/** POST /api/v2/returns — opens a new return request for an order. */
export const createReturn = async (input: CreateReturnInput) => {
  const raw = await fetcher<unknown>(`/api/v2/returns`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return CreateReturnResponseSchema.parse(raw).data;
};
