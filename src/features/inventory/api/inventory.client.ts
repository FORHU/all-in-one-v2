import { fetcher } from "@/shared/lib/http";
import {
  LocationsResponseSchema,
  LocationResponseSchema,
  LocationDetailResponseSchema,
  StockSummaryResponseSchema,
  StockResponseSchema,
  TransactionsResponseSchema,
  StockProductSearchResponseSchema,
  StockVariantOptionsResponseSchema,
  type InventoryLocation,
} from "../contracts/inventory.contract";

export type GetLocationsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "code" | "type" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

/** GET /api/v2/inventory/locations — admin-only, requires x-tenant-slug (attached by http.ts). */
export const getLocations = async (params: GetLocationsParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/inventory/locations${qs ? `?${qs}` : ""}`,
  );
  return LocationsResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};

/** GET /api/v2/inventory/locations/:id — includes every stock row at this location. */
export const getLocation = async (id: string) => {
  const raw = await fetcher<unknown>(`/api/v2/inventory/locations/${id}`);
  return LocationDetailResponseSchema.parse(raw).data;
};

export type CreateLocationInput = {
  name: string;
  code: string;
  type: string;
  isPrimary?: boolean;
  address?: Record<string, unknown>;
};

/** POST /api/v2/inventory/locations */
export const createLocation = async (input: CreateLocationInput) => {
  const raw = await fetcher<unknown>("/api/v2/inventory/locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return LocationResponseSchema.parse(raw).data;
};

export type UpdateLocationInput = Partial<
  Pick<InventoryLocation, "name" | "code" | "type" | "isPrimary" | "isActive">
> & { address?: Record<string, unknown> };

/** PUT /api/v2/inventory/locations/:id */
export const updateLocation = async (
  id: string,
  input: UpdateLocationInput,
) => {
  const raw = await fetcher<unknown>(`/api/v2/inventory/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return LocationResponseSchema.parse(raw).data;
};

/** GET /api/v2/inventory/variant/:variantId — onHand/reserved/available rolled up across all locations. */
export const getVariantStock = async (variantId: string) => {
  const raw = await fetcher<unknown>(`/api/v2/inventory/variant/${variantId}`);
  return StockSummaryResponseSchema.parse(raw).data;
};

/** GET /api/v2/products/admin?search= — see StockProductSearchResultSchema for why this bypasses the products feature's own client. */
export const searchProductsForStock = async (query: string) => {
  const raw = await fetcher<unknown>(
    `/api/v2/products/admin?search=${encodeURIComponent(query)}&limit=8`,
  );
  return StockProductSearchResponseSchema.parse(raw).data.items;
};

/** GET /api/v2/products/:productId/variants — see StockVariantOptionSchema for why this bypasses the products feature's own client. */
export const getProductVariantsForStock = async (productId: string) => {
  const raw = await fetcher<unknown>(`/api/v2/products/${productId}/variants`);
  return StockVariantOptionsResponseSchema.parse(raw).data.items;
};

export type SetStockInput = {
  variantId: string;
  locationId: string;
  onHand: number;
  reorderPoint?: number;
};

/** POST /api/v2/inventory/stock — upserts the onHand count for one variant at one location. */
export const setStock = async (input: SetStockInput) => {
  const raw = await fetcher<unknown>("/api/v2/inventory/stock", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return StockResponseSchema.parse(raw).data;
};

export type GetTransactionsParams = {
  locationId?: string;
  variantId?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "quantity" | "type";
  sortOrder?: "asc" | "desc";
};

/**
 * GET /api/v2/inventory/transactions — the paginated audit trail of onHand
 * changes. `locationId` is accepted here for forward-compat with the query
 * param the route already reads, but note InventoryRepository.getTransactions
 * currently only filters by tenantId + variantId — passing it has no effect
 * on the backend yet.
 */
export const getTransactions = async (params: GetTransactionsParams = {}) => {
  const query = new URLSearchParams();
  if (params.locationId) query.set("locationId", params.locationId);
  if (params.variantId) query.set("variantId", params.variantId);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/inventory/transactions${qs ? `?${qs}` : ""}`,
  );
  return TransactionsResponseSchema.parse(raw).data;
};
