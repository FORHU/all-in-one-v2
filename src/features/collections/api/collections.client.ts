import { fetcher } from "@/shared/lib/http";
import {
  CollectionsResponseSchema,
  CollectionResponseSchema,
  CollectionItemResponseSchema,
  ProductSearchResponseSchema,
  type CollectionsPage,
  type CollectionType,
} from "../contracts/collections.contract";

export type GetCollectionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

/** GET /api/v2/collections — requires x-tenant-slug, attached by http.ts. */
export async function getCollections(
  params: GetCollectionsParams = {},
): Promise<CollectionsPage> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const raw = await fetcher<unknown>(
    `/api/v2/collections${qs ? `?${qs}` : ""}`,
  );
  return CollectionsResponseSchema.parse(raw).data;
}

export type CollectionWriteInput = {
  title: string;
  // Required, not derived server-side — CollectionService has no
  // slugify-from-title fallback, so callers must always send one.
  slug: string;
  type: CollectionType;
  // Nullable, not just optional: an explicit `null` clears the field on an
  // existing collection. `undefined` is dropped by JSON.stringify before
  // the request is sent, so it can't express "clear this".
  description?: string | null;
  imageUrl?: string | null;
  isPublic?: boolean;
};

/** POST /api/v2/collections — admin-only (catalog:write). */
export async function createCollection(input: CollectionWriteInput) {
  const raw = await fetcher<unknown>("/api/v2/collections", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return CollectionResponseSchema.parse(raw).data;
}

/** PUT /api/v2/collections/:id — admin-only (catalog:write). */
export async function updateCollection(
  id: string,
  input: Partial<CollectionWriteInput>,
) {
  const raw = await fetcher<unknown>(`/api/v2/collections/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return CollectionResponseSchema.parse(raw).data;
}

/** DELETE /api/v2/collections/:id — admin-only (catalog:delete), soft-deletes. */
export async function deleteCollection(id: string) {
  await fetcher<unknown>(`/api/v2/collections/${id}`, { method: "DELETE" });
}

/**
 * POST /api/v2/collections/:collectionId/items — admin-only (catalog:write).
 * `position` defaults to 0 server-side if omitted, which would stack every
 * added item at the same position — callers should pass the next open slot
 * (e.g. the current item count) so items append in the order they're added.
 */
export async function addCollectionItem(
  collectionId: string,
  productId: string,
  position: number,
) {
  const raw = await fetcher<unknown>(
    `/api/v2/collections/${collectionId}/items`,
    { method: "POST", body: JSON.stringify({ productId, position }) },
  );
  return CollectionItemResponseSchema.parse(raw).data;
}

/** PUT /api/v2/collections/:collectionId/items/reorder — admin-only (catalog:write). */
export async function reorderCollectionItems(
  collectionId: string,
  items: { id: string; position: number }[],
) {
  await fetcher<unknown>(`/api/v2/collections/${collectionId}/items/reorder`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

/** DELETE /api/v2/collections/:collectionId/items/:itemId — admin-only (catalog:delete). */
export async function removeCollectionItem(
  collectionId: string,
  itemId: string,
) {
  await fetcher<unknown>(
    `/api/v2/collections/${collectionId}/items/${itemId}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Product search for the "add to collection" picker. Hits the admin
 * products listing directly — the collections feature can't import the
 * products feature's client (FAOS forbids cross-feature imports), and this
 * only needs a narrow slice of that response anyway.
 */
export async function searchProducts(query: string) {
  const raw = await fetcher<unknown>(
    `/api/v2/products/admin?search=${encodeURIComponent(query)}&limit=8`,
  );
  return ProductSearchResponseSchema.parse(raw).data.items;
}
