import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addCollectionItem,
  removeCollectionItem,
  reorderCollectionItems,
  searchProducts,
  type GetCollectionsParams,
  type CollectionWriteInput,
} from "../api/collections.client";
import { collectionsKeys } from "../api/collections.keys";

export function useCollections(params: GetCollectionsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: collectionsKeys.list(tenantSlug, params),
    queryFn: () => getCollections(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}

export function useCreateCollection(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: CollectionWriteInput) => createCollection(input),
    onValidationError: options?.onValidationError,
    onSuccess: (collection) => {
      queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
      notify.success(`Collection "${collection.title}" created.`);
    },
  });
}

export function useUpdateCollection(
  id: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: Partial<CollectionWriteInput>) =>
      updateCollection(id, input),
    onValidationError: options?.onValidationError,
    onSuccess: (collection) => {
      queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
      notify.success(`Collection "${collection.title}" updated.`);
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
      notify.success("Collection deleted.");
    },
  });
}

/**
 * Adding/removing items updates the modal's own local item list directly
 * from the mutation response (see CollectionFormModal) — invalidation here
 * is only so the card behind the modal (e.g. an item-count badge) is fresh
 * once the modal closes, not to re-drive the modal itself. Re-deriving the
 * modal's editable fields from a live-refetching `collection` prop would
 * risk clobbering an in-progress title/slug edit mid-typing.
 */
export function useAddCollectionItem(collectionId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      productId,
      position,
    }: {
      productId: string;
      position: number;
    }) => addCollectionItem(collectionId, productId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
    },
  });
}

export function useRemoveCollectionItem(collectionId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (itemId: string) => removeCollectionItem(collectionId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
    },
  });
}

/**
 * Fire-and-forget from the caller's perspective — CollectionFormModal
 * reorders its local `items` state optimistically before calling this, and
 * rolls that back itself on error. No success toast: reordering is a quiet,
 * frequent action (every arrow click), not a distinct save step.
 */
export function useReorderCollectionItems(collectionId: string) {
  return useSafeMutation({
    mutationFn: (items: { id: string; position: number }[]) =>
      reorderCollectionItems(collectionId, items),
  });
}

/** Debounce the query string before enabling this — see CollectionFormModal. */
export function useProductSearch(query: string) {
  return useSafeQuery({
    queryKey: [...collectionsKeys.all, "product-search", query] as const,
    queryFn: () => searchProducts(query),
    enabled: query.trim().length >= 2,
  });
}
