import { fetcher } from "@/shared/lib/http";
import {
  TenantMembershipsResponseSchema,
  TenantMembershipResponseSchema,
  MyMembershipsResponseSchema,
  type TenantMembership,
  type MyMembership,
} from "../contracts/tenant-staff.contract";

const BASE_PATH = "/api/v2/tenant-memberships";

/** GET /api/v2/tenant-memberships — this store's roster (ambient tenant). */
export async function getTenantMemberships(): Promise<TenantMembership[]> {
  const raw = await fetcher<unknown>(BASE_PATH);
  return TenantMembershipsResponseSchema.parse(raw).data;
}

/**
 * GET /api/v2/tenant-memberships/mine — every store the caller belongs to,
 * independent of ambient tenant context. `skipTenantHeader` so a stale or
 * foreign tenant slug already in localStorage can never block the very call
 * meant to discover the correct one (used to auto-lock a non-platform-admin
 * to their own store).
 */
export async function getMyMemberships(): Promise<MyMembership[]> {
  const raw = await fetcher<unknown>(`${BASE_PATH}/mine`, {
    skipTenantHeader: true,
  });
  return MyMembershipsResponseSchema.parse(raw).data;
}

/** GET /api/v2/tenant-memberships/all — platform-admin-only, every store's roster at once. */
export async function getAllTenantMemberships(): Promise<TenantMembership[]> {
  const raw = await fetcher<unknown>(`${BASE_PATH}/all`);
  return TenantMembershipsResponseSchema.parse(raw).data;
}

/**
 * POST /api/v2/tenant-memberships — grants a role to an account by email. An
 * ADMIN_MANAGER caller may only pass role: "ADMIN" — the backend
 * (membership.service.ts) is the real boundary; this is instant, not an
 * invite. `tenantId` is only honored server-side for a platform admin (see
 * membership.controller.ts) — used by the unified Staff & Roles page to
 * grant into any store without relying on ambient tenant context. `name` +
 * `password` (both or neither) create a brand-new account on the spot when
 * `email` doesn't match an existing one — omitted, a missing email 404s.
 */
export async function grantMembership(input: {
  email: string;
  role: string;
  tenantId?: string;
  name?: string;
  password?: string;
}): Promise<TenantMembership> {
  const raw = await fetcher<unknown>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return TenantMembershipResponseSchema.parse(raw).data;
}

/** PATCH /api/v2/tenant-memberships/:id — changes an existing member's role. */
export async function updateMembershipRole(
  id: string,
  role: string,
): Promise<TenantMembership> {
  const raw = await fetcher<unknown>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return TenantMembershipResponseSchema.parse(raw).data;
}

/** DELETE /api/v2/tenant-memberships/:id — revokes a member's access to this store. */
export async function removeMembership(id: string): Promise<void> {
  await fetcher<unknown>(`${BASE_PATH}/${id}`, { method: "DELETE" });
}
