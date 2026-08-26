/**
 * Client-side permission tier, derived 1:1 from the backend's platform-wide
 * `UserRole` enum (see shared/auth/api-role.ts) via mapApiRole(). There is no
 * client-side equivalent of the backend's per-tenant `TenantRole`
 * (OWNER/ADMIN/MANAGER/EDITOR/SELLER/VIEWER) — GET /me never returns it, so
 * this file can only distinguish platform-wide tiers, not a staff member's
 * role within the one store they're scoped to. Don't use `Role` to gate
 * store-scoped actions (e.g. deleting a product) that a backend TenantRole,
 * not the platform role, actually controls.
 */
export type Role = "super_admin" | "developer" | "admin" | "viewer";
