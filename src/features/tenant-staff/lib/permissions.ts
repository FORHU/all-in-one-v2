// Pure, dependency-free permission checks for this feature — deliberately
// not a hook. features/tenant-staff can't import features/auth (FAOS
// boundary), so the app layer calls `useMe()` itself and passes the
// resulting `tenantMembership.role` in here, composing the two at the page.

/** Mirrors the backend's TENANT_ROLE_PERMISSIONS[OWNER/ADMIN_MANAGER] grant of `tenant_staff:manage`. */
export function canManageTenantStaff(role: string | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN_MANAGER";
}

/**
 * Mirrors the backend's `tenant_staff:read` grant — broader than
 * canManageTenantStaff: a plain ADMIN can see the store's roster but not
 * grant/edit/revoke anyone on it.
 */
export function canViewTenantStaff(role: string | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN_MANAGER" || role === "ADMIN";
}

export function isOwner(role: string | null | undefined): boolean {
  return role === "OWNER";
}

// Rows an ADMIN_MANAGER (as opposed to an OWNER) can never edit or remove —
// mirrors the backend's PROTECTED_ROLES in membership.service.ts. This is a
// UX convenience (hide/disable the action); the backend remains the real
// enforcement boundary.
const PROTECTED_ROLES = new Set(["OWNER", "ADMIN_MANAGER"]);

export function canActingRoleModify(
  actingRole: string | null | undefined,
  targetRole: string,
): boolean {
  if (actingRole === "OWNER") return true;
  return !PROTECTED_ROLES.has(targetRole);
}

/** Roles selectable in the grant/edit-role dropdown, given the caller's own tenant role. */
export function assignableRoles(
  actingRole: string | null | undefined,
): string[] {
  if (actingRole === "OWNER") {
    return [
      "OWNER",
      "ADMIN_MANAGER",
      "ADMIN",
      "MANAGER",
      "SELLER",
      "EDITOR",
      "VIEWER",
    ];
  }
  return ["ADMIN"];
}
