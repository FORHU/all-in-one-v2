import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import {
  searchSupplierProducts,
  getSupplierProduct,
  importProduct,
  getCategoryOptions,
} from "../api/product-sourcing.client";
import { productSourcingKeys } from "../api/product-sourcing.keys";

// The only suppliers with both a working adapter (real API calls, not a
// `// TODO` stub) and an active `SupplierPartner` row in the DB — see
// docs/Framework-Structure/supplier-import-walkthrough.md. AliExpress is a
// stub, and Printify/Spocket have DB rows but no adapter at all yet.
export const SUPPLIER_OPTIONS = [
  { id: "cj-dropshipping", label: "CJ Dropshipping" },
  { id: "printful", label: "Printful" },
] as const;

export type SupplierOptionId = (typeof SUPPLIER_OPTIONS)[number]["id"];

/** Search the given supplier's live catalog. No-ops on an empty query. */
export function useSupplierSearch(supplierId: string, query: string, page = 1) {
  return useSafeQuery({
    queryKey: productSourcingKeys.search(supplierId, query, page),
    queryFn: () => searchSupplierProducts(supplierId, query, page),
    enabled: query.trim().length > 0,
    // Keep showing the previous page's results while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}

/** Full detail for one external product, to preview before importing. */
export function useSupplierProductDetail(
  supplierId: string,
  externalId: string | null,
) {
  return useSafeQuery({
    queryKey: productSourcingKeys.detail(supplierId, externalId ?? ""),
    queryFn: () => getSupplierProduct(supplierId, externalId as string),
    enabled: externalId !== null,
  });
}

/** The tenant's real categories, for the import preview's category dropdown. */
export function useCategoryOptions() {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: [
      ...productSourcingKeys.all,
      "category-options",
      tenantSlug,
    ] as const,
    queryFn: () => getCategoryOptions(),
    enabled: Boolean(tenantSlug),
  });
}

/** Import the previewed product into the local catalog. */
export function useImportProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({
      supplierId,
      externalId,
      categoryId,
    }: {
      supplierId: string;
      externalId: string;
      categoryId?: string | null;
    }) => importProduct({ supplierId, externalId, categoryId }),
    onSuccess: (product) => {
      notify.success(`Imported "${product.title}" into the catalog.`);
      // Search results and the preview modal cache `alreadyImported` from
      // before this import — without invalidating, they'd keep showing the
      // product as not-yet-imported until an unrelated refetch (page change,
      // new search) happened to occur.
      queryClient.invalidateQueries({
        queryKey: productSourcingKeys.searches(),
      });
      queryClient.invalidateQueries({
        queryKey: productSourcingKeys.details(),
      });
    },
  });
}
