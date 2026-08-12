import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  getCategorySales,
  getCustomerAnalytics,
  getDailySales,
  getSupplierAnalytics,
} from "../api/dashboard.client";
import { dashboardKeys } from "../api/dashboard.keys";

/** Revenue/orders time series for the given date range — the only endpoint the date-range picker drives. */
export function useDailySales(startDate: string, endDate: string) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: dashboardKeys.dailySales(tenantSlug, startDate, endDate),
    queryFn: () => getDailySales(startDate, endDate),
    enabled: Boolean(tenantSlug),
    placeholderData: (prev) => prev,
  });
}

/** All-time revenue by category — not affected by the date-range picker. */
export function useCategorySales() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: dashboardKeys.categorySales(tenantSlug),
    queryFn: getCategorySales,
    enabled: Boolean(tenantSlug),
  });
}

/** All-time supplier performance — not affected by the date-range picker. */
export function useSupplierAnalytics() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: dashboardKeys.supplierAnalytics(tenantSlug),
    queryFn: getSupplierAnalytics,
    enabled: Boolean(tenantSlug),
  });
}

/** Top 10 customers by lifetime spend — not affected by the date-range picker. */
export function useCustomerAnalytics() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: dashboardKeys.customerAnalytics(tenantSlug),
    queryFn: getCustomerAnalytics,
    enabled: Boolean(tenantSlug),
  });
}
