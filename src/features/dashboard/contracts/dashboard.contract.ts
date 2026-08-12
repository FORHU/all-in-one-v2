import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed against AnalyticsRepository
 * (all-in-one-v2-api/src/repositories/analytics.repository.ts) and the
 * corresponding Prisma models (AnalyticsDailySales, AnalyticsCategorySales,
 * AnalyticsSupplier, AnalyticsCustomer). These endpoints return raw Prisma
 * rows — there's no DTO/mapper layer on the backend for analytics — so
 * Decimal columns (revenueAmount, totalRevenue, lifetimeSpend,
 * avgOrderValue, avgDeliveryDays) serialize as numeric strings over the
 * wire (Prisma.Decimal's toJSON returns a string), not JS numbers.
 *
 * `/analytics/top-products` is intentionally not modeled here: its
 * repository query (`getProductSales`) has no `include: { product }`, so
 * the response only carries a bare `productId` with no title/slug to
 * display — not usable for UI until the backend adds that include.
 */

const decimalValue = z.union([z.string(), z.number()]);

export const DailySalesPointSchema = z.object({
  id: z.string(),
  date: z.string(),
  ordersCount: z.number(),
  revenueAmount: decimalValue,
  bestSellingProductId: z.string().nullable(),
});

const CategorySchema = z.object({ id: z.string(), name: z.string() });
export const CategorySalesSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  totalRevenue: decimalValue,
  totalOrders: z.number(),
  totalProductsSold: z.number(),
  category: CategorySchema,
});

const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
});
export const SupplierSalesSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  productsImported: z.number(),
  totalOrders: z.number(),
  totalRevenue: decimalValue,
  failedOrders: z.number(),
  avgDeliveryDays: decimalValue.nullable(),
  supplier: SupplierSchema,
});

const CustomerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});
export const CustomerSalesSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  lifetimeSpend: decimalValue,
  totalOrders: z.number(),
  avgOrderValue: decimalValue,
  lastOrderedAt: z.string().nullable(),
  customer: CustomerSchema,
});

function listResponse<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    status: z.string(),
    statusCode: z.number(),
    data: z.array(item),
  });
}

export const DailySalesResponseSchema = listResponse(DailySalesPointSchema);
export const CategorySalesResponseSchema = listResponse(CategorySalesSchema);
export const SupplierSalesResponseSchema = listResponse(SupplierSalesSchema);
export const CustomerSalesResponseSchema = listResponse(CustomerSalesSchema);

export type DailySalesPoint = z.infer<typeof DailySalesPointSchema>;
export type CategorySales = z.infer<typeof CategorySalesSchema>;
export type SupplierSales = z.infer<typeof SupplierSalesSchema>;
export type CustomerSales = z.infer<typeof CustomerSalesSchema>;
