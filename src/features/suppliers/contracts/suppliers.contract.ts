import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * api-guide.md publishes no sample JSON for this endpoint. `id` is assumed
 * to be the kebab-case slug the guide's own examples route with directly
 * (`/suppliers/cj-dropshipping/search`, `.../products/CJ123456789`) rather
 * than an opaque UUID, since nothing else in the guide exposes a separate
 * slug field for suppliers. This shape is a best guess and will throw
 * immediately in development if the real response disagrees — that's the
 * signal to correct this file, same as happened with the collections
 * contract.
 */
export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

/** GET /api/v2/suppliers/available */
export const SuppliersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(SupplierSchema),
});
