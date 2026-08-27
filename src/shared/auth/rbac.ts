import { Permission } from "./permissions";
import { Role } from "./roles";

/**
 * Mirrors the backend's `platform:manage` gate: only SUPER_ADMIN/DEVELOPER
 * accounts hold it (see e.g. all-in-one-v2-api's tenant/staff/supplier
 * routes). A plain ADMIN is a tenant-scoped staff account and gets none of
 * these — same reasoning `app/(admin)/layout.tsx`'s `isPlatformAdmin` and
 * `features/tenants/hooks/useTenants.ts` already document ad hoc; this table
 * is what lets that reasoning be expressed as a reusable permission check
 * instead of a raw role comparison copy-pasted at each call site.
 */
const rolePermissions: Record<Role, Partial<Record<Permission, boolean>>> = {
  super_admin: {
    "tenants:manage": true,
    "staff:manage": true,
    "suppliers:credentials:manage": true,
    "audit:read": true,
  },
  developer: {
    "tenants:manage": true,
    "staff:manage": true,
    "suppliers:credentials:manage": true,
    "audit:read": true,
  },
  admin: {},
  viewer: {},
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.[permission] ?? false;
}
