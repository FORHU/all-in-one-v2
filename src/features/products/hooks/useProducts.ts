import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getAdminProducts,
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
