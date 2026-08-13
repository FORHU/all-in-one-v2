import { fetcher } from "@/shared/lib/http";
import {
  CollectionsResponseSchema,
  type CollectionsPage,
} from "../contracts/collections.contract";

export type GetCollectionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

/** GET /api/v2/collections — requires x-tenant-slug, attached by http.ts. */
export async function getCollections(
  params: GetCollectionsParams = {},
): Promise<CollectionsPage> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/collections${qs ? `?${qs}` : ""}`,
  );
  return CollectionsResponseSchema.parse(raw).data;
}
