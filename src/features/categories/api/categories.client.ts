import { fetcher } from "@/shared/lib/http";
import {
  CategoriesResponseSchema,
  CategoryDetailResponseSchema,
  type CategoriesPage,
  type CategoryDetail,
} from "../contracts/categories.contract";

export type GetCategoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

/** GET /api/v2/categories — requires x-tenant-slug, attached by http.ts. */
export async function getCategories(
  params: GetCategoriesParams = {},
): Promise<CategoriesPage> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/categories${qs ? `?${qs}` : ""}`);
  return CategoriesResponseSchema.parse(raw).data;
}

/** GET /api/v2/categories/:slug */
export async function getCategoryBySlug(slug: string): Promise<CategoryDetail> {
  const raw = await fetcher<unknown>(
    `/api/v2/categories/${encodeURIComponent(slug)}`,
  );
  return CategoryDetailResponseSchema.parse(raw).data;
}
