import { fetcher } from "@/shared/lib/http";
import {
  AdminProductsResponseSchema,
  AdminProductResponseSchema,
  CategoryOptionsResponseSchema,
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
