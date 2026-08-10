import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Ground-truthed against `SupplierService.getAvailableSuppliers()`
 * (backend), which maps the in-memory `supplierRegistry` to
 * `{ id: adapter.supplierId }` — nothing else. The kebab-case `id` (e.g.
 * "cj-dropshipping") is the same slug the search/detail/import routes take
 * as `:supplierId`. `name`/`logoUrl`/`isActive` were an earlier guess that
 * doesn't exist on the real response and threw a ZodError on every load —
 * do not re-add them without a corresponding backend field to back them.
 */
export const SupplierSchema = z.object({
  id: z.string(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

/** GET /api/v2/suppliers/available */
export const SuppliersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(SupplierSchema),
});
