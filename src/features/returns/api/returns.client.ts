import { fetcher } from "@/shared/lib/http";
import {
  ReturnsResponseSchema,
  ReturnsByOrderResponseSchema,
  ReturnMutationResponseSchema,
  IssueRefundResponseSchema,
  CreateReturnResponseSchema,
  type ReturnStatus,
} from "../contracts/returns.contract";

export type GetReturnsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
  status?: ReturnStatus;
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
