/**
 * Only covers actions actually gated by the backend's `platform:manage`
 * permission (see all-in-one-v2-api's requirePermission('platform:manage')
 * call sites) — the one axis `Role` can correctly judge, since it's derived
 * from the same platform-wide UserRole the backend checks. Store-scoped
 * resources (products, orders, collections, customers, returns, inventory)
 * are deliberately left out: gating them here would use the wrong axis
 * (platform role instead of the invisible-to-the-client TenantRole) and
 * could wrongly block a tenant OWNER or wrongly allow a low-privilege
 * platform account, so those stay backend-enforced only.
 */
export type Permission =
  | "tenants:manage"
  | "staff:manage"
  | "suppliers:credentials:manage"
  | "audit:read";
