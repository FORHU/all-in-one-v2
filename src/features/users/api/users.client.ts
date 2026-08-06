import { fetcher } from "@/shared/lib/http";
import { UsersResponseSchema } from "../contracts/users.contract";

export type GetUsersParams = {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
};

export const getUsers = async (params: GetUsersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.role) query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/users${qs ? `?${qs}` : ""}`);
  return UsersResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};
