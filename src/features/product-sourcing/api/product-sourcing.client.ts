import { fetcher } from "@/shared/lib/http";
import {
  SupplierSearchResponseSchema,
  SupplierProductDetailResponseSchema,
  ImportProductResponseSchema,
  type SupplierSearchPage,
  type SupplierProductDetail,
  type ImportProductInput,
  type ImportedProduct,
} from "../contracts/product-sourcing.contract";

/**
 * GET /api/v2/suppliers/:supplierId/search — returns the whole page object
 * (not just `items`), since `total`/`totalPages` are what the UI needs to
 * render "page X of Y" pagination controls.
 */
export async function searchSupplierProducts(
  supplierId: string,
  query: string,
  page = 1,
  limit = 10,
): Promise<SupplierSearchPage> {
  const qs = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  });
  const raw = await fetcher<unknown>(
    `/api/v2/suppliers/${supplierId}/search?${qs}`,
  );
  return SupplierSearchResponseSchema.parse(raw).data;
}

/** GET /api/v2/suppliers/:supplierId/products/:externalId */
export async function getSupplierProduct(
  supplierId: string,
  externalId: string,
): Promise<SupplierProductDetail> {
  const raw = await fetcher<unknown>(
    `/api/v2/suppliers/${supplierId}/products/${externalId}`,
  );
  return SupplierProductDetailResponseSchema.parse(raw).data;
}

/** POST /api/v2/products/import */
export async function importProduct(
  input: ImportProductInput,
): Promise<ImportedProduct> {
  const raw = await fetcher<unknown>("/api/v2/products/import", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return ImportProductResponseSchema.parse(raw).data;
}
