import { fetcher } from "@/shared/lib/http";
import {
  TenantsResponseSchema,
  type Tenant,
} from "../contracts/tenants.contract";

/**
 * GET /api/v2/tenants
 * Unlike every other catalog endpoint, this one is not itself tenant-scoped —
 * it's the list a super-admin picks a tenant from in the first place.
 */
export async function getTenants(): Promise<Tenant[]> {
  const raw = await fetcher<unknown>("/api/v2/tenants");
  return TenantsResponseSchema.parse(raw).data;
}
