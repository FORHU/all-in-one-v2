import { fetcher } from "@/shared/lib/http";
import {
  AdminProductsResponseSchema,
  AdminProductResponseSchema,
  CategoryOptionsResponseSchema,
  BrandCountsResponseSchema,
  RenameBrandResponseSchema,
  type ProductStatus,
  type ProductVisibility,
} from "../contracts/products.contract";

export type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "price" | "status" | "brand";
  sortOrder?: "asc" | "desc";
  status?: ProductStatus;
  categoryId?: string;
  // Exact match, distinct from `search` — "only this brand" (e.g. a Brand
  // tile click), not a free-text guess.
  brand?: string;
};

/**
 * GET /api/v2/products/admin — admin/staff-only (403s otherwise), requires
 * x-tenant-slug (attached by http.ts), returns products in every status.
 */
export const getAdminProducts = async (params: GetAdminProductsParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.brand) query.set("brand", params.brand);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/products/admin${qs ? `?${qs}` : ""}`,
  );
  return AdminProductsResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};

export type ProductWriteInput = {
  title: string;
  slug?: string;
  description?: string;
  // Nullable, not just optional: an explicit `null` clears the field on an
  // existing product. `undefined` is dropped by JSON.stringify before the
  // request is even sent, so it can't express "clear this" — only "don't
  // touch this" (which is what create mode wants for an unset field).
  brand?: string | null;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  featured?: boolean;
  price?: number | null;
  salePrice?: number | null;
  compareAtPrice?: number | null;
  thumbnailUrl?: string | null;
  categoryId?: string | null;
};

/** POST /api/v2/products — admin-only (catalog:write). */
export const createProduct = async (input: ProductWriteInput) => {
  const raw = await fetcher<unknown>("/api/v2/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return AdminProductResponseSchema.parse(raw).data;
};

/** PUT /api/v2/products/:id — admin-only (catalog:write). */
export const updateProduct = async (
  id: string,
  input: Partial<ProductWriteInput>,
) => {
  const raw = await fetcher<unknown>(`/api/v2/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return AdminProductResponseSchema.parse(raw).data;
};

/** DELETE /api/v2/products/:id — admin-only (catalog:delete), soft-deletes the product. */
export const deleteProduct = async (id: string) => {
  await fetcher<unknown>(`/api/v2/products/${id}`, { method: "DELETE" });
};

/**
 * GET /api/v2/categories, narrowed to just {id, name} for a product-form
 * select. Requests a high limit — this needs every category for the
 * dropdown, not one paginated page of them.
 */
export const getCategoriesForSelect = async () => {
  const raw = await fetcher<unknown>("/api/v2/categories?limit=100");
  return CategoryOptionsResponseSchema.parse(raw).data.items;
};

/** GET /api/v2/products/brands — admin-only (catalog:read). */
export const getBrandCounts = async () => {
  const raw = await fetcher<unknown>("/api/v2/products/brands");
  return BrandCountsResponseSchema.parse(raw).data.items;
};

/**
 * PATCH /api/v2/products/brands/:brand — admin-only (catalog:write). Bulk
 * renames a brand across every product carrying it, or clears it when
 * `newBrand` is null. The closest thing to edit/delete for a value with no
 * row of its own.
 */
export const renameBrand = async (brand: string, newBrand: string | null) => {
  const raw = await fetcher<unknown>(
    `/api/v2/products/brands/${encodeURIComponent(brand)}`,
    { method: "PATCH", body: JSON.stringify({ newBrand }) },
  );
  return RenameBrandResponseSchema.parse(raw).data;
};
