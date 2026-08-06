import { fetcher } from "@/shared/lib/http";
import {
  SuppliersResponseSchema,
  type Supplier,
} from "../contracts/suppliers.contract";

/** GET /api/v2/suppliers/available */
export async function getAvailableSuppliers(): Promise<Supplier[]> {
  const raw = await fetcher<unknown>("/api/v2/suppliers/available");
  return SuppliersResponseSchema.parse(raw).data;
}
