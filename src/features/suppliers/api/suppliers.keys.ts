export const suppliersKeys = {
  all: ["suppliers"] as const,
  lists: () => [...suppliersKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached supplier connections out of react-query's cache.
  list: (tenantSlug: string | null) =>
    [...suppliersKeys.lists(), tenantSlug] as const,
  syncJobs: {
    all: (tenantSlug: string | null) =>
      [...suppliersKeys.all, "sync-jobs", tenantSlug] as const,
    list: (tenantSlug: string | null, page: number, limit: number) =>
      [...suppliersKeys.syncJobs.all(tenantSlug), "list", page, limit] as const,
    logs: (jobId: string) =>
      [...suppliersKeys.all, "sync-jobs", "logs", jobId] as const,
  },
} as const;
