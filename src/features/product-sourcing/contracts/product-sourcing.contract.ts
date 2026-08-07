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
export const SupplierSearchResultSchema = z.object({
  id: z.string(),
  nameEn: z.string().optional(),
  bigImage: z.string().optional(),
  sellPrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  categoryName: z.string().optional(),
});

export type SupplierSearchResult = z.infer<typeof SupplierSearchResultSchema>;

/** GET /api/v2/suppliers/:supplierId/search */
export const SupplierSearchResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(SupplierSearchResultSchema),
});

export const SupplierProductDetailSchema = z.object({
  pid: z.string(),
  productNameEn: z.string().optional(),
  bigImage: z.string().optional(),
  sellPrice: z.coerce.number().optional(),
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
