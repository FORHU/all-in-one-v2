import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import {
  searchSupplierProducts,
  getSupplierProduct,
  importProduct,
} from "../api/product-sourcing.client";
import { productSourcingKeys } from "../api/product-sourcing.keys";

// Only supplier wired up so far — matches the one `SupplierPartner` row
// created via the manual walkthrough (docs/Framework-Structure/
// supplier-import-walkthrough.md). Promote to a param if a second supplier
// partner is ever onboarded.
export const SOURCING_SUPPLIER_ID = "cj-dropshipping";

/** Search the connected supplier's live catalog. No-ops on an empty query. */
export function useSupplierSearch(query: string, page = 1) {
  return useSafeQuery({
    queryKey: productSourcingKeys.search(SOURCING_SUPPLIER_ID, query, page),
    queryFn: () => searchSupplierProducts(SOURCING_SUPPLIER_ID, query, page),
    enabled: query.trim().length > 0,
    // Keep showing the previous page's results while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}

/** Full detail for one external product, to preview before importing. */
export function useSupplierProductDetail(externalId: string | null) {
  return useSafeQuery({
    queryKey: productSourcingKeys.detail(
      SOURCING_SUPPLIER_ID,
      externalId ?? "",
    ),
    queryFn: () =>
      getSupplierProduct(SOURCING_SUPPLIER_ID, externalId as string),
    enabled: externalId !== null,
  });
}

/** Import the previewed product into the local catalog. */
export function useImportProduct() {
  return useSafeMutation({
    mutationFn: (externalId: string) =>
      importProduct({ supplierId: SOURCING_SUPPLIER_ID, externalId }),
    onSuccess: (product) => {
      notify.success(`Imported "${product.title}" into the catalog.`);
    },
  });
}
