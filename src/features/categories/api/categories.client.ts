import { fetcher } from "@/shared/lib/http";
import {
  CategoriesResponseSchema,
  CategoryDetailResponseSchema,
  CategoryResponseSchema,
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

export type CategoryWriteInput = {
  name: string;
  // Required, not derived server-side — unlike products, CategoryService
  // has no slugify-from-name fallback, so callers must always send one.
  slug: string;
  // Nullable, not just optional: an explicit `null` clears the description
  // on an existing category. `undefined` is dropped by JSON.stringify
  // before the request is sent, so it can't express "clear this".
  description?: string | null;
  // `null` = top-level (no parent). `undefined` on an update leaves the
  // parent unchanged.
  parentId?: string | null;
};

/** POST /api/v2/categories — admin-only (catalog:write). */
export async function createCategory(input: CategoryWriteInput) {
  const raw = await fetcher<unknown>("/api/v2/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return CategoryResponseSchema.parse(raw).data;
}

/** PUT /api/v2/categories/:id — admin-only (catalog:write). */
export async function updateCategory(
  id: string,
  input: Partial<CategoryWriteInput>,
) {
  const raw = await fetcher<unknown>(`/api/v2/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return CategoryResponseSchema.parse(raw).data;
}

/** DELETE /api/v2/categories/:id — admin-only (catalog:delete). */
export async function deleteCategory(id: string) {
  await fetcher<unknown>(`/api/v2/categories/${id}`, { method: "DELETE" });
}
