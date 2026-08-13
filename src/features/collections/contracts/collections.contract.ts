import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * api-guide.md publishes no sample JSON for this endpoint, and the first
 * real response (captured via DevTools) contradicted the guide's own prose
 * ("active collections... e.g. Summer Sale, Best Sellers" implied a flat
 * list): collections are actually a self-referencing tree exactly like
 * categories (`parentId` / `children`, seen nesting an "OUTFIT" under a
 * "LOOKBOOK"). Field is `title`, not `name`. There's no `isActive` —
 * visibility is `isPublic` + `isDeleted` instead. `type` distinguishes tree
 * levels seen so far but isn't documented as a closed enum, so it's kept a
 * plain string rather than guessed at as a z.enum. `imageFileId` and
 * `metadata` are deliberately not declared — unread by anything here, so
 * Zod strips them at parse time same as the password hash in
 * users.contract.ts. `items` IS declared (narrowed to what the item
 * management UI needs) — the repository's `collectionWithItems` include
 * means every collection response (list/detail/create/update) already
 * carries it.
 */
export const CollectionItemProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
});

export const CollectionItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  position: z.number(),
  product: CollectionItemProductSchema,
});

export type CollectionItem = z.infer<typeof CollectionItemSchema>;

export type Collection = {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  sortOrder: number;
  imageUrl: string | null;
  isPublic: boolean;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: Collection[];
  items: CollectionItem[];
};

export const CollectionSchema: z.ZodType<Collection> = z.lazy(() =>
  z.object({
    id: z.string(),
    tenantId: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    type: z.string(),
    sortOrder: z.number(),
    imageUrl: z.string().nullable(),
    isPublic: z.boolean(),
    isDeleted: z.boolean(),
    parentId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(CollectionSchema).default([]),
    items: z.array(CollectionItemSchema).default([]),
  }),
);

/** GET /api/v2/collections — { status, statusCode, data: { items, total, page, limit, totalPages } }. */
export const CollectionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CollectionSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type CollectionsPage = z.infer<typeof CollectionsResponseSchema>["data"];

/**
 * The six `CollectionType` values seen in the Prisma enum
 * (all-in-one-v2-api/prisma/schema/catalog.prisma). Kept as a plain const
 * tuple (not a z.enum on CollectionSchema itself, per that schema's own
 * note on `type`) so the write form has a closed set of options without
 * tightening the read contract.
 */
export const COLLECTION_TYPES = [
  "OUTFIT",
  "LOOKBOOK",
  "BUNDLE",
  "ROUTINE",
  "SETUP",
  "ROOM_BUNDLE",
] as const;

export type CollectionType = (typeof COLLECTION_TYPES)[number];

/**
 * POST/PUT /api/v2/collections(/:id) — both re-fetch/return the row with
 * `collectionWithItems` included (items + children), so CollectionSchema's
 * `children` field is always populated here (unlike categories' `create`).
 */
export const CollectionResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: CollectionSchema,
});

/** POST /api/v2/collections/:collectionId/items — returns the created item. */
export const CollectionItemResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: CollectionItemSchema,
});

/**
 * GET /api/v2/products/admin — called directly (not through the products
 * feature's client, which this feature can't import per FAOS) to power the
 * "add product to collection" search. Narrowed to just what a search result
 * row needs, ignoring every other field on the admin listing response.
 */
export const ProductSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
});

export const ProductSearchResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(ProductSearchResultSchema),
  }),
});

export type ProductSearchResult = z.infer<typeof ProductSearchResultSchema>;
