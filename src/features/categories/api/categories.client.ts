import { fetcher } from "@/shared/lib/http";
import {
  CategoriesResponseSchema,
  CategoryDetailResponseSchema,
  type Category,
  type CategoryDetail,
} from "../contracts/categories.contract";

/** GET /api/v2/categories — requires x-tenant-slug, attached by http.ts. */
export async function getCategories(): Promise<Category[]> {
  const raw = await fetcher<unknown>("/api/v2/categories");
  return CategoriesResponseSchema.parse(raw).data;
}

/** GET /api/v2/categories/:slug */
export async function getCategoryBySlug(slug: string): Promise<CategoryDetail> {
  const raw = await fetcher<unknown>(
    `/api/v2/categories/${encodeURIComponent(slug)}`,
  );
  return CategoryDetailResponseSchema.parse(raw).data;
}
