import { fetcher } from "@/shared/lib/http";
import {
  CategorySalesResponseSchema,
  CustomerSalesResponseSchema,
  DailySalesResponseSchema,
  SupplierSalesResponseSchema,
} from "../contracts/dashboard.contract";

/** GET /api/v2/analytics/daily — tenant-scoped, requires startDate/endDate. */
export const getDailySales = async (startDate: string, endDate: string) => {
  const query = new URLSearchParams({ startDate, endDate });
  const raw = await fetcher<unknown>(
    `/api/v2/analytics/daily?${query.toString()}`,
  );
  return DailySalesResponseSchema.parse(raw).data;
};

/** GET /api/v2/analytics/categories — tenant-scoped, all-time, no params. */
export const getCategorySales = async () => {
  const raw = await fetcher<unknown>("/api/v2/analytics/categories");
  return CategorySalesResponseSchema.parse(raw).data;
};

/** GET /api/v2/analytics/suppliers — tenant-scoped, all-time, no params. */
export const getSupplierAnalytics = async () => {
  const raw = await fetcher<unknown>("/api/v2/analytics/suppliers");
  return SupplierSalesResponseSchema.parse(raw).data;
};

/** GET /api/v2/analytics/customers — tenant-scoped, top 10 by lifetime spend. */
export const getCustomerAnalytics = async () => {
  const raw = await fetcher<unknown>("/api/v2/analytics/customers");
  return CustomerSalesResponseSchema.parse(raw).data;
};
