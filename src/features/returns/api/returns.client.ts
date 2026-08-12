import { fetcher } from "@/shared/lib/http";
import {
  ReturnsResponseSchema,
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
