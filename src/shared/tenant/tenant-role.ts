/**
 * Mirrors the backend's `TenantRole` enum (all-in-one-v2-api's
 * prisma/schema/tenant.prisma) by value, not by import — this is a
 * per-tenant membership role, distinct from the platform `Role`
 * (shared/auth/roles.ts). Kept as a plain string union: an account's
 * membership role for a store, as returned on `tenantMembership.role`
 * from GET /api/v2/users/me.
 */
export type TenantRole =
  | "OWNER"
  | "ADMIN_MANAGER"
  | "ADMIN"
  | "MANAGER"
  | "SELLER"
  | "EDITOR"
  | "VIEWER";
