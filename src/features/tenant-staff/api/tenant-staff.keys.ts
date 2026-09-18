export const tenantStaffKeys = {
  all: ["tenant-staff"] as const,
  lists: () => [...tenantStaffKeys.all, "list"] as const,
  mine: () => [...tenantStaffKeys.all, "mine"] as const,
  crossTenant: () => [...tenantStaffKeys.all, "cross-tenant"] as const,
} as const;
