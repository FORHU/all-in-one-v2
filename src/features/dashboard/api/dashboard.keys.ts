export const dashboardKeys = {
  all: ["dashboard"] as const,
  dailySales: (tenantSlug: string | null, startDate: string, endDate: string) =>
    [...dashboardKeys.all, "daily", tenantSlug, startDate, endDate] as const,
  categorySales: (tenantSlug: string | null) =>
    [...dashboardKeys.all, "categories", tenantSlug] as const,
  supplierAnalytics: (tenantSlug: string | null) =>
    [...dashboardKeys.all, "suppliers", tenantSlug] as const,
  customerAnalytics: (tenantSlug: string | null) =>
    [...dashboardKeys.all, "customers", tenantSlug] as const,
} as const;
