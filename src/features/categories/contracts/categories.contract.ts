import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Categories are a self-referencing tree (parentId / children). The live
 * `all-in-one-v2-api` response only ever showed 2 populated levels in seed
 * data, and leaf nodes omit `children` entirely rather than sending `[]` —
 * `.default([])` below covers that gap defensively.
 */
export type Category = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: Category[];
};

export const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    tenantId: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    parentId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(CategorySchema).default([]),
  }),
);

/** GET /api/v2/categories — { status, statusCode, data: { items, total, page, limit, totalPages } }. */
export const CategoriesResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CategorySchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type CategoriesPage = z.infer<typeof CategoriesResponseSchema>["data"];

export const CategoryDetailSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parent: CategorySchema.nullable().optional(),
  children: z.array(CategorySchema).default([]),
  // Server-computed (category.service.ts's getCategoryBySlug), not a raw
  // product listing — the detail page links out to the admin products
  // table (filtered by this category) rather than rendering products here.
  productCount: z.number(),
});

export type CategoryDetail = z.infer<typeof CategoryDetailSchema>;

export const CategoryDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: CategoryDetailSchema,
});

/**
 * POST/PUT /api/v2/categories(/:id) — the backend returns the raw category
 * row. `update` re-fetches through `findById` (parent/children included);
 * `create` returns the bare created row with no `children` relation at all,
 * which is why CategorySchema's `children` field falls back to
 * `.default([])` rather than being required.
 */
export const CategoryResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: CategorySchema,
});
