import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoriesForSelect,
  getBrandCounts,
  renameBrand,
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductMedia,
  createProductMedia,
  updateProductMedia,
  deleteProductMedia,
  resyncAllProducts,
  resyncProduct,
  type GetAdminProductsParams,
  type ProductWriteInput,
  type VariantWriteInput,
  type MediaWriteInput,
} from "../api/products.client";
import { productsKeys } from "../api/products.keys";

export function useAdminProducts(params: GetAdminProductsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: productsKeys.list(tenantSlug, params),
    queryFn: () => getAdminProducts(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}

/**
 * Single product in the full admin (editable) shape, for a caller that only
 * has an id — e.g. a collection item row, which only carries a denormalized
 * {id, title, thumbnailUrl} slice, not enough to seed ProductFormModal.
 */
export function useProduct(id: string | null) {
  return useSafeQuery({
    queryKey: productsKeys.detail(id ?? ""),
    queryFn: () => getAdminProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: ProductWriteInput) => createProduct(input),
    onValidationError: options?.onValidationError,
    onSuccess: (product) => {
      // Prefix-invalidate every cached page/search combo, not just the one
      // this component happens to be viewing.
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Product "${product.title}" created.`);
    },
  });
}

export function useUpdateProduct(
  id: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: Partial<ProductWriteInput>) => updateProduct(id, input),
    onValidationError: options?.onValidationError,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Product "${product.title}" updated.`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success("Product deleted.");
    },
  });
}

/**
 * Bulk-archives every given product id — BulkToolbar's "Archive" action.
 * useUpdateProduct is a per-id hook, so it can't be called in a loop (rules
 * of hooks) for a dynamic bulk selection — this calls the `updateProduct`
 * API client function directly instead, one request per id in parallel, and
 * never rejects itself (Promise.allSettled) so a caller can report a mixed
 * succeeded/failed summary instead of the whole batch erroring out on the
 * first failure. Same invalidate-on-success pattern as useDeleteProduct.
 */
export function useBulkArchiveProducts() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (ids: string[]) =>
      Promise.allSettled(
        ids.map((id) => updateProduct(id, { status: "ARCHIVED" })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useCategoryOptions() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: [...productsKeys.all, "category-options", tenantSlug] as const,
    queryFn: () => getCategoriesForSelect(),
    enabled: Boolean(tenantSlug),
  });
}

export function useBrandCounts() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: [...productsKeys.all, "brand-counts", tenantSlug] as const,
    queryFn: () => getBrandCounts(),
    enabled: Boolean(tenantSlug),
  });
}

/** Only meaningful in edit mode — `enabled` is false while `productId` is empty (create mode). */
export function useProductVariants(productId: string) {
  return useSafeQuery({
    queryKey: productsKeys.variants(productId),
    queryFn: () => getProductVariants(productId),
    enabled: Boolean(productId),
  });
}

/**
 * Adding/removing/editing a variant updates ProductFormModal's own local
 * variant list directly from the mutation response — invalidation here is
 * only so a stale cached list is refreshed once the modal closes, same
 * reasoning as useAddCollectionItem.
 */
export function useCreateProductVariant(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: VariantWriteInput) =>
      createProductVariant(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useUpdateProductVariant(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      variantId,
      input,
    }: {
      variantId: string;
      input: Partial<VariantWriteInput>;
    }) => updateProductVariant(productId, variantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
    },
  });
}

export function useDeleteProductVariant(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (variantId: string) =>
      deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

/** Only meaningful in edit mode — `enabled` is false while `productId` is empty (create mode). */
export function useProductMedia(productId: string) {
  return useSafeQuery({
    queryKey: productsKeys.media(productId),
    queryFn: () => getProductMedia(productId),
    enabled: Boolean(productId),
  });
}

/**
 * Same reasoning as the variant mutations above: ProductFormModal updates its
 * own local media list directly from each mutation's response, and also
 * invalidates the products list — marking a gallery image primary rewrites
 * the product's thumbnailUrl, which the admin listing displays.
 */
export function useCreateProductMedia(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: MediaWriteInput) =>
      createProductMedia(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useUpdateProductMedia(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      mediaId,
      input,
    }: {
      mediaId: string;
      input: Partial<MediaWriteInput>;
    }) => updateProductMedia(productId, mediaId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useDeleteProductMedia(productId: string) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (mediaId: string) => deleteProductMedia(productId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

/**
 * Re-queues every already-imported product (optionally scoped to one
 * supplier) for a stock/price/attribute refresh. Fire-and-forget from the
 * UI's perspective — the actual DB update happens later once the worker
 * processes the jobs, so this doesn't invalidate the products list (there's
 * nothing new to show yet, and doing so would just refetch the same stale
 * numbers).
 */
export function useResyncAllProducts() {
  return useSafeMutation({
    mutationFn: (supplierId?: string) => resyncAllProducts(supplierId),
    onSuccess: (result) => {
      notify.success(
        result.jobsQueued > 0
          ? `Queued a stock refresh for ${result.productsQueued} product${result.productsQueued === 1 ? "" : "s"}. This runs in the background — recheck stock in a moment.`
          : "No already-imported products found to refresh.",
      );
    },
  });
}

/**
 * Refreshes one already-imported product synchronously — unlike
 * useResyncAllProducts, the update is real by the time this resolves, so
 * (unlike that hook) this one does invalidate the products list.
 */
export function useResyncProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (productId: string) => resyncProduct(productId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(`Refreshed "${result.title}" from its supplier.`);
    },
  });
}

/**
 * Exposes products-list invalidation for cross-feature composition at the
 * app layer — e.g. app/(admin)/tools/page.tsx invalidates the catalog after
 * product-sourcing's useImportProduct succeeds, so a Products tab open in
 * the same minute (within the global 60s staleTime) doesn't sit on a
 * pre-import cache. App pages can't call useQueryClient directly (FAOS "App
 * Layer Discipline" forbids importing @tanstack/react-query outside the
 * features layer), so this wraps the invalidation in a hook the products
 * feature owns and exposes via its manifest, instead of the page reaching
 * into productsKeys + its own queryClient.
 */
export function useInvalidateProductsList() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
}

export function useRenameBrand() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      brand,
      newBrand,
    }: {
      brand: string;
      newBrand: string | null;
    }) => renameBrand(brand, newBrand),
    onSuccess: (result, variables) => {
      // Prefix-invalidate — matches the tenantSlug-suffixed brand-counts key
      // and every cached products list page/search combo.
      queryClient.invalidateQueries({
        queryKey: [...productsKeys.all, "brand-counts"],
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      notify.success(
        variables.newBrand
          ? `Renamed ${result.updatedCount} product${result.updatedCount === 1 ? "" : "s"} to "${variables.newBrand}".`
          : `Cleared brand from ${result.updatedCount} product${result.updatedCount === 1 ? "" : "s"}.`,
      );
    },
  });
}
