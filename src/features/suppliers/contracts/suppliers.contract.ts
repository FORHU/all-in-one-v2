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

export const SyncStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
export const SYNC_STATUS_VALUES = SyncStatusSchema.options;

/**
 * Ground-truthed against `SupplierRepository.getSyncJobs()` — nested
 * `supplier` is deliberately narrowed server-side to
 * {id, name, displayName}; `SupplierPartner.config` can hold API
 * keys/base URLs and must never round-trip into this contract.
 */
export const SyncJobSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  action: z.string(),
  status: SyncStatusSchema,
  retries: z.number(),
  maxRetries: z.number(),
  scheduledAt: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  supplier: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
});

export type SyncJob = z.infer<typeof SyncJobSchema>;

/** GET /api/v2/suppliers/sync-jobs */
export const SyncJobsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(SyncJobSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type SyncJobsPage = z.infer<typeof SyncJobsResponseSchema>["data"];

export const SyncLogSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  action: z.string(),
  status: SyncStatusSchema,
  recordsProcessed: z.number(),
  errorMessage: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export type SyncLog = z.infer<typeof SyncLogSchema>;

/** GET /api/v2/suppliers/sync-jobs/:jobId/logs */
export const SyncLogsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(SyncLogSchema),
});
