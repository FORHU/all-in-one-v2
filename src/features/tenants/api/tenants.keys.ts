export const tenantsKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantsKeys.all, "list"] as const,
} as const;
