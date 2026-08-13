import { fetcher } from "@/shared/lib/http";
import {
  TenantsResponseSchema,
  type Tenant,
} from "../contracts/tenants.contract";

/**
 * GET /api/v2/tenants/all — admin-only (platform:manage), includes every
 * tenant regardless of status. Unlike every other catalog endpoint, this one
 * is not itself tenant-scoped — it's the list a super-admin picks a tenant
 * from in the first place.
 *
 * Deliberately not GET /api/v2/tenants (no `/all`) — that's the public
 * listing and silently filters to ACTIVE-only, which would make the
 * Onboarding/Suspended status badges and filter on the admin Tenants table
 * unreachable no matter what's actually in the database.
 */
export async function getTenants(): Promise<Tenant[]> {
  const raw = await fetcher<unknown>("/api/v2/tenants/all");
  return TenantsResponseSchema.parse(raw).data;
}
