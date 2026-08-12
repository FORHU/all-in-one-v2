import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Backend surface: src/modules/inventory/* in all-in-one-v2-api.
 * `type` on a location is a free-form string column (not a Prisma enum) —
 * WAREHOUSE / RETAIL_STORE / SUPPLIER_HUB / VIRTUAL are just the conventional
 * values used elsewhere, not an enforced set.
 */

// ── Locations (GET/POST/PUT /api/v2/inventory/locations) ───────────────────

export const LOCATION_TYPE_VALUES = [
  "WAREHOUSE",
  "RETAIL_STORE",
  "SUPPLIER_HUB",
  "VIRTUAL",
] as const;

export const InventoryLocationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  code: z.string(),
  type: z.string(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  address: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * GET /api/v2/inventory/locations — { status, statusCode, data: { items, total,
 * page, limit, totalPages } }. Matches the backend's generic PageResult
 * wrapper, same as orders.contract.ts / customers.contract.ts.
 */
export const LocationsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(InventoryLocationSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const LocationResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: InventoryLocationSchema,
});

export type InventoryLocation = z.infer<typeof InventoryLocationSchema>;
export type LocationsPage = z.infer<typeof LocationsResponseSchema>["data"];

// ── Stock (GET /variant/:id, POST /stock) ───────────────────────────────────

/** Minimal variant summary — full product/variant contract lives in a future `products` feature. */
export const StockVariantSummarySchema = z
  .object({
    id: z.string(),
    sku: z.string().nullable(),
    title: z.string(),
  })
  .passthrough();

export const InventoryStockSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  variantId: z.string(),
  locationId: z.string(),
  onHand: z.number(),
  reserved: z.number(),
  available: z.number(),
  reorderPoint: z.number(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InventoryStock = z.infer<typeof InventoryStockSchema>;

/** A stock row as embedded in a location's detail view — includes the variant. */
export const LocationStockRowSchema = InventoryStockSchema.extend({
  variant: StockVariantSummarySchema,
});

export const LocationDetailSchema = InventoryLocationSchema.extend({
  stocks: z.array(LocationStockRowSchema),
});

export const LocationDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: LocationDetailSchema,
});

export type LocationDetail = z.infer<typeof LocationDetailSchema>;
export type LocationStockRow = z.infer<typeof LocationStockRowSchema>;

/** A stock row as embedded in a variant's cross-location summary — includes the location. */
export const StockLocationRowSchema = InventoryStockSchema.extend({
  location: InventoryLocationSchema,
});

export const StockSummarySchema = z.object({
  variantId: z.string(),
  totalOnHand: z.number(),
  totalReserved: z.number(),
  totalAvailable: z.number(),
  locations: z.array(StockLocationRowSchema),
});

export const StockSummaryResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: StockSummarySchema,
});

export const StockResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: InventoryStockSchema,
});

export type StockSummary = z.infer<typeof StockSummarySchema>;
export type StockLocationRow = z.infer<typeof StockLocationRowSchema>;

// ── Transactions (GET /api/v2/inventory/transactions) ───────────────────────

export const INVENTORY_TRANSACTION_TYPE_VALUES = [
  "PURCHASE",
  "SALE",
  "RETURN",
  "SUPPLIER_SYNC",
  "MANUAL_ADJUSTMENT",
] as const;

export const InventoryTransactionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productVariantId: z.string(),
  type: z.enum(INVENTORY_TRANSACTION_TYPE_VALUES),
  quantity: z.number(),
  previousStock: z.number(),
  newStock: z.number(),
  referenceId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * GET /api/v2/inventory/transactions — { status, statusCode, data: { items,
 * total, page, limit, totalPages } }. Same PageResult wrapper as locations.
 */
export const TransactionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(InventoryTransactionSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type InventoryTransaction = z.infer<typeof InventoryTransactionSchema>;
export type InventoryTransactionType = InventoryTransaction["type"];
export type TransactionsPage = z.infer<
  typeof TransactionsResponseSchema
>["data"];
