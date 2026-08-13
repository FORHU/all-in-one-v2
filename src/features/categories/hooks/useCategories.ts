import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type GetCategoriesParams,
  type CategoryWriteInput,
} from "../api/categories.client";
import { categoriesKeys } from "../api/categories.keys";

export function useCategories(params: GetCategoriesParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: categoriesKeys.list(tenantSlug, params),
    queryFn: () => getCategories(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}

export function useCreateCategory(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: CategoryWriteInput) => createCategory(input),
    onValidationError: options?.onValidationError,
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      notify.success(`Category "${category.name}" created.`);
    },
  });
}

export function useUpdateCategory(
  id: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: Partial<CategoryWriteInput>) =>
      updateCategory(id, input),
    onValidationError: options?.onValidationError,
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      // Also invalidate the detail query — CategoryFormModal can be opened
      // from CategoryDetailView itself (editing the category you're
      // currently viewing), and without this its header/subcategories would
      // keep showing pre-edit data until an unrelated refetch happened to
      // occur.
      queryClient.invalidateQueries({ queryKey: categoriesKeys.details() });
      notify.success(`Category "${category.name}" updated.`);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      // Same reasoning as useUpdateCategory: deleting the category currently
      // shown on CategoryDetailView must invalidate its detail query too, so
      // the page refetches, gets a 404, and falls into its existing "Category
      // not found" state — instead of silently continuing to show the
      // now-deleted category as if nothing happened.
      queryClient.invalidateQueries({ queryKey: categoriesKeys.details() });
      notify.success("Category deleted.");
    },
  });
}
