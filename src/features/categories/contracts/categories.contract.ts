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

export const CategoriesResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(CategorySchema),
});

/**
 * GET /api/v2/categories/:slug embeds products assigned directly to that
 * category (not rolled up from children). This is a local, minimal view of
 * a product — the full product contract belongs to a future products
 * feature, not here. `.passthrough()` tolerates extra fields we don't read.
 */
export const CategoryProductSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    thumbnailUrl: z.string().nullable().optional(),
    price: z.string().optional(),
  })
  .passthrough();

export type CategoryProduct = z.infer<typeof CategoryProductSchema>;

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
  products: z.array(CategoryProductSchema).default([]),
});

export type CategoryDetail = z.infer<typeof CategoryDetailSchema>;

export const CategoryDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: CategoryDetailSchema,
});
