import { z } from "zod";

/** GET /api/v2/tenants — one entry per storefront hosted on the platform. */
export const TenantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  domain: z.string(),
  status: z.string(),
  settings: z
    .object({
      theme: z.string().optional(),
      currency: z.string().optional(),
      defaultLanguage: z.string().optional(),
    })
    .partial()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const TenantsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(TenantSchema),
});
