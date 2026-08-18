import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed by curling the real endpoints against the local backend
 * (not api-guide.md, and not the backend's own `CJProduct`/`CJProductDetail`
 * TypeScript interfaces — both disagreed with what CJ's live API actually
 * returns). The two endpoints use different field names for the same data:
 *
 *   search (listV2)         detail (query)
 *   ----------------         --------------
 *   id                       pid
 *   nameEn                   productNameEn
 *   bigImage                 bigImage
 *   sku                      productSku
 *   sellPrice (string)       sellPrice (string)
 *
 * `id` from a search result is the `externalId` passed to both the detail
 * and import endpoints — the detail response's own `pid` is the same value,
 * just under a different key.
 */
// CJ's `sellPrice` is usually a plain numeric string ("6.63"), but for
// multi-variant products it's a range instead ("18.00 -- 20.90") —
// confirmed by curling /product/listV2 directly, where ~1 in 8 results in
// a real search comes back this way. `Number()` turns that into NaN, which
// z.coerce.number() rejects, throwing for the *entire* result array over
// one bad element. Take the low end of a range (the "from" price) and fall
// back to undefined — never NaN — so one oddly-priced variant product
// doesn't take down the whole search.
function coercePrice(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isNaN(value) ? undefined : value;
  if (typeof value !== "string") return undefined;
  const low = value.split("--")[0]?.trim();
  const n = Number(low);
  return Number.isNaN(n) ? undefined : n;
}

export const SupplierSearchResultSchema = z.object({
  id: z.string(),
  nameEn: z.string().optional(),
  bigImage: z.string().optional(),
  sellPrice: z.preprocess(coercePrice, z.number().optional()),
  sku: z.string().optional(),
  categoryName: z.string().optional(),
  // Tenant-scoped: true when this external product already has a
  // CatalogProduct in THIS store — see SupplierService.searchSupplier.
  alreadyImported: z.boolean().optional(),
  catalogProductId: z.string().nullable().optional(),
});

export type SupplierSearchResult = z.infer<typeof SupplierSearchResultSchema>;

/**
 * GET /api/v2/suppliers/:supplierId/search — { status, statusCode, data:
 * { items, total, page, limit, totalPages } }. Matches the backend's
 * generic PageResult wrapper (same shape as /v2/customers, /v2/users), not
 * the bare array this endpoint used to return before the backend added
 * real pagination.
 */
export const SupplierSearchPageSchema = z.object({
  items: z.array(SupplierSearchResultSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type SupplierSearchPage = z.infer<typeof SupplierSearchPageSchema>;

export const SupplierSearchResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: SupplierSearchPageSchema,
});

// One buyable color/size combination of a product — CJ returns these
// alongside the parent product on the detail endpoint (confirmed by curling
// /product/query directly: a real product can carry 30+ of these).
export const SupplierProductVariantSchema = z.object({
  vid: z.string(),
  // CJ sends an explicit `null` here (not just omitting the field) for
  // variants without a distinct English name — confirmed by curling
  // /product/query for a multi-size/color product where every variant came
  // back this way. `.optional()` alone only tolerates a missing field, not
  // a present `null`, and previously threw a raw ZodError for any such
  // product (see supplier.service.ts's getSupplierProduct 404 fix for the
  // same class of "CJ returns null" bug).
  variantNameEn: z.string().nullable().optional(),
  variantKey: z.string().optional(),
  variantImage: z.string().optional(),
  variantSku: z.string().optional(),
  variantSellPrice: z.preprocess(coercePrice, z.number().optional()),
});

export type SupplierProductVariant = z.infer<
  typeof SupplierProductVariantSchema
>;

export const SupplierProductDetailSchema = z.object({
  pid: z.string(),
  productNameEn: z.string().optional(),
  bigImage: z.string().optional(),
  // Full image gallery — bigImage is just its first entry. Optional/absent
  // on some CJ products, so the preview falls back to bigImage alone.
  productImageSet: z.array(z.string()).optional(),
  // Same range-string quirk as SupplierSearchResultSchema.sellPrice — see
  // coercePrice's comment above.
  sellPrice: z.preprocess(coercePrice, z.number().optional()),
  productSku: z.string().optional(),
  categoryName: z.string().optional(),
  description: z.string().optional(),
  productWeight: z.string().optional(),
  variants: z.array(SupplierProductVariantSchema).optional(),
  // Tenant-scoped: true when this product already has a CatalogProduct in
  // THIS store — see SupplierService.getSupplierProduct.
  alreadyImported: z.boolean().optional(),
  catalogProductId: z.string().nullable().optional(),
});

export type SupplierProductDetail = z.infer<typeof SupplierProductDetailSchema>;

/** GET /api/v2/suppliers/:supplierId/products/:externalId */
export const SupplierProductDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: SupplierProductDetailSchema,
});

export const ImportProductInputSchema = z.object({
  supplierId: z.string(),
  externalId: z.string(),
  // Admin's explicit category choice from the import UI: a real id, `null`
  // for explicit "No category", or omitted to fall back to the backend's
  // auto-create-from-supplier-label behavior.
  categoryId: z.string().nullable().optional(),
});

export type ImportProductInput = z.infer<typeof ImportProductInputSchema>;

// Duplicated from products.contract.ts's CategoryOptionSchema rather than
// imported — product-sourcing can't import from the products feature (FAOS
// cross-feature import boundary, enforced by tools/validate-architecture.mjs
// regardless of manifest `exposes`).
export const CategoryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type CategoryOption = z.infer<typeof CategoryOptionSchema>;

export const CategoryOptionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CategoryOptionSchema),
  }),
});

// The imported CatalogProduct row. Only the fields this feature reads are
// asserted — the real row has more (tenantId, timestamps, etc).
export const ImportedProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  status: z.string(),
});

export type ImportedProduct = z.infer<typeof ImportedProductSchema>;

// POST /api/v2/products/import bypasses the shared { status, statusCode,
// data } envelope helper — it returns { message, data } directly.
export const ImportProductResponseSchema = z.object({
  message: z.string(),
  data: ImportedProductSchema,
});
