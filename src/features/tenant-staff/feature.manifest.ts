/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "tenant-staff",
  dependsOn: [] as const,
  exposes: [
    "useTenantMembers",
    "useMyMemberships",
    "useAllTenantMemberships",
    "useGrantMembership",
    "useUpdateMembershipRole",
    "useRemoveMembership",
    "canManageTenantStaff",
    "TenantStaffTable",
    "GrantMembershipModal",
    "EditMembershipModal",
  ] as const,
} as const;

export type TenantStaffManifest = typeof featureManifest;
