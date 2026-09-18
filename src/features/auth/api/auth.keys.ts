export const authKeys = {
  all: ["auth"] as const,
  // GET /me's response now includes `tenantMembership`, which varies with
  // the ambient tenant (x-tenant-slug) — keyed on tenantSlug so switching
  // stores (or the admin layout's auto-lock correcting a stale slug) fetches
  // a fresh response instead of serving a cached one from a different
  // tenant's context.
  me: (tenantSlug?: string | null) =>
    [...authKeys.all, "me", tenantSlug ?? "platform"] as const,
} as const;
