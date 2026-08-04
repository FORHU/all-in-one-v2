/**
 * FAOS — Tenant slug storage (single source of truth)
 *
 * Both the HTTP layer (`shared/lib/http.ts`) and the tenant store
 * (`shared/tenant/tenant.store.ts`) read/write the selected tenant through
 * here, so the two can never drift out of sync. Mirrors `shared/lib/token.ts`.
 */

const TENANT_KEY = "selected_tenant_slug";

export function getTenantSlug(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TENANT_KEY);
}

export function setTenantSlug(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TENANT_KEY, slug);
}

export function clearTenantSlug(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TENANT_KEY);
}
