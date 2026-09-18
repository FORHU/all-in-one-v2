import { z } from "zod";

const TenantRefSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});

/** One row of GET /api/v2/tenant-memberships — a store's membership roster. */
export const TenantMembershipSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    username: z.string(),
  }),
  // Present on GET /tenant-memberships/all (cross-tenant) so each row can be
  // labeled with its store — absent on the ambient GET / (single store, the
  // tenant is already implied by context).
  tenant: TenantRefSchema.optional(),
});

export type TenantMembership = z.infer<typeof TenantMembershipSchema>;

export const TenantMembershipsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(TenantMembershipSchema),
});

export const TenantMembershipResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: TenantMembershipSchema,
});

/** One row of GET /api/v2/tenant-memberships/mine — a store the caller belongs to. */
export const MyMembershipSchema = z.object({
  id: z.string(),
  role: z.string(),
  status: z.string(),
  tenant: TenantRefSchema,
});

export type MyMembership = z.infer<typeof MyMembershipSchema>;

export const MyMembershipsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(MyMembershipSchema),
});
