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
 * plain string rather than guessed at as a z.enum. `imageFileId` is
 * deliberately not declared — unread by anything here, so Zod strips it at
 * parse time same as the password hash in users.contract.ts. `metadata` IS
 * declared (as a loose record) — the form reads/writes `metadata.season`
 * off it, per CatalogCollection.metadata's own doc comment listing `season`
 * as one of its vertical-specific params. `items` IS declared (narrowed to
 * what the item management UI needs) — the repository's `collectionWithItems`
 * include means every collection response (list/detail/create/update)
 * already carries it.
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
  // Which garment/component role this item fills within the collection
  // (e.g. "Top", "Bottom", "Shoes") — null when the item isn't part of a
  // slotted OUTFIT/lookbook and is just a plain curated pick.
  slot: z.string().nullable(),
  // Whether this item is a required part of the look (e.g. the top) or an
  // optional add-on (e.g. a belt) — only meaningful for OUTFIT-style types.
  isOptional: z.boolean(),
  // Which specific color/size variant represents this item — null = show
  // the product's default variant. See CatalogCollectionItem.productVariantId.
  productVariantId: z.string().nullable().default(null),
  // Explicit photo override, independent of productVariantId — lets an item
  // show one specific shot from the product's own gallery even when its
  // variants don't carry distinct photos of their own (e.g. one color sold
  // across several sizes, with all the visual variety living in the
  // product's lifestyle photoshoot instead of per-variant images). Falls
  // back to the selected variant's photo, then the product's own thumbnail,
  // when null. See CatalogCollectionItem.imageUrl.
  imageUrl: z.string().nullable().default(null),
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
  // Which category page (e.g. "Women") this collection is featured under —
  // null = not tied to any category. See CatalogCollection.categoryId.
  categoryId: string | null;
  // Vertical-specific params — currently only `season` is read/written
  // (by the form's Season field). Kept as a loose record rather than a
  // typed shape since the backend imposes no structure on it.
  metadata: Record<string, unknown> | null;
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
    categoryId: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable().default(null),
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
 * Closed set offered by the form's Season field — stored as
 * `metadata.season` (a free-form string server-side, so an older/foreign
 * value read back from the API just won't match any option's label).
 */
export const SEASON_OPTIONS = [
  "SPRING",
  "SUMMER",
  "FALL",
  "WINTER",
  "ALL_SEASON",
] as const;

export type Season = (typeof SEASON_OPTIONS)[number];

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

/**
 * GET /api/v2/products/:productId/variants — admin variant picker, called
 * directly (not via the products feature's client, same FAOS boundary as
 * ProductSearchResultSchema above). Mirrors AdminProductVariantDto
 * (all-in-one-v2-api's product.mapper.ts) narrowed to what the item-level
 * variant picker needs; `stockAvailable` is read by that DTO too but unused
 * here, so it's left out and Zod strips it.
 */
export const ProductVariantOptionSchema = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  title: z.string(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
});

export type ProductVariantOption = z.infer<typeof ProductVariantOptionSchema>;

export const ProductVariantsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(ProductVariantOptionSchema),
  }),
});

/**
 * GET /api/v2/products/:productId/media — the product's own gallery
 * (product-level only; ProductRepository.listMedia excludes anything linked
 * to a specific variant, so this never overlaps with ProductVariantOption's
 * thumbnails). Powers the item-level photo picker's fallback for products
 * whose photo variety lives at the product level rather than per-variant
 * (e.g. one color shot from several angles, sold across many sizes).
 */
export const ProductMediaOptionSchema = z.object({
  id: z.string(),
  url: z.string(),
});

export type ProductMediaOption = z.infer<typeof ProductMediaOptionSchema>;

export const ProductMediaResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(ProductMediaOptionSchema),
  }),
});

// Duplicated from products.contract.ts's CategoryOptionSchema rather than
// imported — collections can't import from the products feature (FAOS
// cross-feature import boundary, enforced by tools/validate-architecture.mjs
// regardless of manifest `exposes`).
export const CategoryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type CategoryOption = z.infer<typeof CategoryOptionSchema>;

/**
 * GET /api/v2/categories, narrowed to just {id, name} for the collection
 * form's category select — see products.contract.ts's identically-named
 * schema for why this is a paginated envelope narrowed down to `items`.
 */
export const CategoryOptionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CategoryOptionSchema),
  }),
});
