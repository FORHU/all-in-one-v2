import { fetcher } from "@/shared/lib/http";
import {
  SuppliersResponseSchema,
  SyncJobsResponseSchema,
  SyncLogsResponseSchema,
  type Supplier,
  type SyncJobsPage,
  type SyncLog,
} from "../contracts/suppliers.contract";

/** GET /api/v2/suppliers/available */
export async function getAvailableSuppliers(): Promise<Supplier[]> {
  const raw = await fetcher<unknown>("/api/v2/suppliers/available");
  return SuppliersResponseSchema.parse(raw).data;
}

export type GetSyncJobsParams = { page?: number; limit?: number };

/** GET /api/v2/suppliers/sync-jobs */
export async function getSyncJobs(
  params: GetSyncJobsParams = {},
): Promise<SyncJobsPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const raw = await fetcher<unknown>(`/api/v2/suppliers/sync-jobs?${qs}`);
  return SyncJobsResponseSchema.parse(raw).data;
}

/** GET /api/v2/suppliers/sync-jobs/:jobId/logs */
export async function getSyncLogs(jobId: string): Promise<SyncLog[]> {
  const raw = await fetcher<unknown>(
    `/api/v2/suppliers/sync-jobs/${jobId}/logs`,
  );
  return SyncLogsResponseSchema.parse(raw).data;
}
