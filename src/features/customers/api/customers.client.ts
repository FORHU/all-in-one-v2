import { fetcher } from "@/shared/lib/http";
import { CustomersResponseSchema } from "../contracts/customers.contract";

export type GetCustomersParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "email"
    | "username"
    | "name"
    | "lastLoginAt";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
};

/** GET /api/v2/customers — requires x-tenant-slug, attached by http.ts. */
export const getCustomers = async (params: GetCustomersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/customers${qs ? `?${qs}` : ""}`);
  return CustomersResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};
