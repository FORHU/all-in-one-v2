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
  type GetAdminProductsParams,
  type ProductWriteInput,
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
