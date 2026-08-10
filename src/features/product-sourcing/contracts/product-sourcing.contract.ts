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

export const SupplierProductDetailSchema = z.object({
  pid: z.string(),
  productNameEn: z.string().optional(),
  bigImage: z.string().optional(),
  // Same range-string quirk as SupplierSearchResultSchema.sellPrice — see
  // coercePrice's comment above.
  sellPrice: z.preprocess(coercePrice, z.number().optional()),
  productSku: z.string().optional(),
  categoryName: z.string().optional(),
  description: z.string().optional(),
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
});

export type ImportProductInput = z.infer<typeof ImportProductInputSchema>;

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
