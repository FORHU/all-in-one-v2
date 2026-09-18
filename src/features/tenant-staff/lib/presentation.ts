// Display labels/styles for a store's TenantRole membership roster. Mirrors
// features/staff/lib/presentation.ts's conventions but for the per-tenant
// TenantRole enum (shared/tenant/tenant-role.ts) rather than the platform
// UserRole — kept as its own copy since features/tenant-staff can't depend
// on features/staff (FAOS boundary).

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN_MANAGER: "Admin Manager",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SELLER: "Seller",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  OWNER: { bg: "var(--shop-danger-bg)", color: "var(--shop-accent)" },
  ADMIN_MANAGER: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
  ADMIN: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  MANAGER: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
  SELLER: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
  EDITOR: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
  VIEWER: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export const UNKNOWN_STYLE = {
  bg: "var(--shop-neutral-bg)",
  color: "var(--shop-text-muted)",
};

// TenantMembership.status values (see the Prisma model's inline comment:
// "ACTIVE, SUSPENDED, INVITED") — used by the unified Staff & Roles page to
// badge a tenant-membership row the same way features/staff's STATUS_STYLES
// badges a platform account's isActive.
export const MEMBERSHIP_STATUS_STYLES: Record<
  string,
  { bg: string; color: string }
> = {
  active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  suspended: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
  invited: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export function displayRole(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function roleOptions(roles: string[]) {
  return roles.map((value) => ({
    value,
    label: displayRole(value),
    indicatorColor: (ROLE_STYLES[value] ?? UNKNOWN_STYLE).color,
  }));
}

export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
