import { fetcher } from "@/shared/lib/http";
import {
  AdminProductsResponseSchema,
  type ProductStatus,
} from "../contracts/products.contract";

export type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "price" | "status" | "brand";
  sortOrder?: "asc" | "desc";
  status?: ProductStatus;
};

/**
 * GET /api/v2/products/admin — admin/staff-only (403s otherwise), requires
 * x-tenant-slug (attached by http.ts), returns products in every status.
 * There is no `category` query param on this endpoint — category is only
 * available per-row on the response, not as a server-side filter.
 */
export const getAdminProducts = async (params: GetAdminProductsParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/products/admin${qs ? `?${qs}` : ""}`,
  );
  return AdminProductsResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};
