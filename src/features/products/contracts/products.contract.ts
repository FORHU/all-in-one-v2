import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed against `AdminProductListingItemDto`
 * (all-in-one-v2-api/src/services/product/dto/product-listing.dto.ts) and
 * the `ProductStatus`/`ProductVisibility` Prisma enums. This is the admin
 * management endpoint (GET /api/v2/products/admin) — it returns products in
 * every status (DRAFT/READY/PUBLISHED/ARCHIVED), unlike the storefront
 * listing which only returns PUBLISHED. Do not conflate the two contracts.
 */
export const ProductStatusSchema = z.enum([
  "DRAFT",
  "READY",
  "PUBLISHED",
  "ARCHIVED",
]);

export const ProductVisibilitySchema = z.enum([
  "PUBLIC",
  "PRIVATE",
  "HIDDEN",
  "MEMBERS_ONLY",
]);

const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AdminProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  // Present on the response but not currently surfaced in the admin UI —
  // product-import.service.ts never maps a value into it, so it's null for
  // every product regardless of source (including suppliers, like Printful,
  // whose data actually has a brand). Kept in the contract since it's a
  // real field on the response; re-add to the UI once import populates it.
  brand: z.string().nullable(),
  status: ProductStatusSchema,
  visibility: ProductVisibilitySchema,
  thumbnailUrl: z.string().nullable(),
  price: z.number().nullable(),
  salePrice: z.number().nullable(),
  compareAtPrice: z.number().nullable(),
  category: ProductCategorySchema.nullable(),
  // Count of non-deleted variants, not the variants themselves — the admin
  // listing is a flat management table, not a per-product detail view.
  variantCount: z.number(),
  inStock: z.boolean(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StatusCountsSchema = z.object({
  DRAFT: z.number(),
  READY: z.number(),
  PUBLISHED: z.number(),
  ARCHIVED: z.number(),
});

/** GET /api/v2/products/admin — { status, statusCode, data: { items, total, page, limit, totalPages, statusCounts } }. */
export const AdminProductsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(AdminProductSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    // Catalog-wide status breakdown — unfiltered by the current
    // search/status query params, so the stats bar stays stable while the
    // table below it is filtered.
    statusCounts: StatusCountsSchema,
  }),
});

/**
 * POST/PUT /api/v2/products(/:id) — the backend re-fetches the written row
 * through the same admin-listing shape and mapper, so create/update responses
 * are AdminProductSchema-shaped just like a row from the list endpoint.
 */
export const AdminProductResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: AdminProductSchema,
});

export const CategoryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * GET /api/v2/categories now returns a paginated envelope (see
 * categories.contract.ts's CategoriesResponseSchema) — this narrows it down
 * to just the {id, name} pairs a <select> needs, ignoring the pagination
 * metadata. `getCategoriesForSelect` requests a high limit so the dropdown
 * isn't silently truncated to the default page size.
 */
export const CategoryOptionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CategoryOptionSchema),
  }),
});

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type ProductVisibility = z.infer<typeof ProductVisibilitySchema>;
export type AdminProduct = z.infer<typeof AdminProductSchema>;
export type AdminProductsPage = z.infer<
  typeof AdminProductsResponseSchema
>["data"];
export type CategoryOption = z.infer<typeof CategoryOptionSchema>;
export type StatusCounts = z.infer<typeof StatusCountsSchema>;
