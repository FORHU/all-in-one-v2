import { fetcher } from "@/shared/lib/http";
import { env } from "@/shared/lib/env";
import { getToken } from "@/shared/lib/token";
import { getTenantSlug } from "@/shared/tenant/tenant-storage";
import { ApiError } from "@/shared/errors/api-error";
import {
  CollectionsResponseSchema,
  CollectionResponseSchema,
  CollectionItemResponseSchema,
  ProductSearchResponseSchema,
  CategoryOptionsResponseSchema,
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
  // Nullable, not just optional: an explicit `null` clears the category on
  // an existing collection, same convention as `description`/`imageUrl`.
  categoryId?: string | null;
  // Nests this collection under another (e.g. an OUTFIT under a LOOKBOOK for
  // "Shop the Look"). Only top-level collections are offered as parents in
  // the form — see CollectionFormModal — so nesting stays two levels deep,
  // matching what CollectionRepository's `collectionWithItems` include
  // eagerly loads.
  parentId?: string | null;
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
  extra?: { slot?: string | null; isOptional?: boolean },
) {
  const raw = await fetcher<unknown>(
    `/api/v2/collections/${collectionId}/items`,
    {
      method: "POST",
      body: JSON.stringify({ productId, position, ...extra }),
    },
  );
  return CollectionItemResponseSchema.parse(raw).data;
}

/**
 * PUT /api/v2/collections/:collectionId/items/:itemId — admin-only
 * (catalog:write). Used to set an item's slot/optional flag without
 * removing and re-adding it (which would also reset its position).
 */
export async function updateCollectionItem(
  collectionId: string,
  itemId: string,
  data: { slot?: string | null; isOptional?: boolean },
) {
  const raw = await fetcher<unknown>(
    `/api/v2/collections/${collectionId}/items/${itemId}`,
    { method: "PUT", body: JSON.stringify(data) },
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
 *
 * `categoryId` filters server-side (the admin listing already supports it —
 * see ProductController.adminList), so picking e.g. "Shoes" while text is
 * still empty browses that whole category instead of requiring a query.
 */
export async function searchProducts(query: string, categoryId?: string) {
  const params = new URLSearchParams({ limit: "8" });
  if (query) params.set("search", query);
  if (categoryId) params.set("categoryId", categoryId);

  const raw = await fetcher<unknown>(`/api/v2/products/admin?${params}`);
  return ProductSearchResponseSchema.parse(raw).data.items;
}

/**
 * POST /api/v2/file-uploads/upload — admin-only (catalog:write). Bypasses
 * `fetcher()`: it always forces a JSON content-type, which would break the
 * multipart boundary an upload needs. Returns the S3 URL to store as the
 * collection/outfit's `imageUrl`.
 *
 * `slug` and `productIds` only shape the S3 key for readability (a
 * `{slug}-{uuid}` filename under a supplier-name folder, resolved
 * server-side from the product ids) — the backend never treats either as
 * the object's actual identity, since a slug can be edited after upload.
 */
export async function uploadCollectionImage(
  file: File,
  context: { slug?: string; productIds?: string[] } = {},
): Promise<string> {
  const token = getToken();
  const tenantSlug = getTenantSlug();
  const body = new FormData();
  body.append("file", file);
  body.append("folder", "collections");
  if (context.slug) body.append("slug", context.slug);
  if (context.productIds?.length) {
    body.append("productIds", context.productIds.join(","));
  }

  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/v2/file-uploads/upload`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
      },
      body,
    },
  );

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {}

  if (!res.ok) {
    throw new ApiError(
      payload?.message || "Image upload failed",
      res.status === 401 ? "AUTH" : res.status === 403 ? "FORBIDDEN" : "SERVER",
      { status: res.status, code: payload?.code, details: payload?.details },
    );
  }

  const url = payload?.data?.url;
  if (typeof url !== "string") {
    throw new ApiError("Upload response missing a url", "SERVER");
  }
  return url;
}

/**
 * GET /api/v2/categories, narrowed to just {id, name} for the collection
 * form's category select. Requests a high limit — this needs every category
 * for the dropdown, not one paginated page of them.
 */
export async function getCategoriesForSelect() {
  const raw = await fetcher<unknown>("/api/v2/categories?limit=100");
  return CategoryOptionsResponseSchema.parse(raw).data.items;
}
