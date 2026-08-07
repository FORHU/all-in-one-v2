import { fetcher } from "@/shared/lib/http";
import {
  SupplierSearchResponseSchema,
  SupplierProductDetailResponseSchema,
  ImportProductResponseSchema,
  type SupplierSearchResult,
  type SupplierProductDetail,
  type ImportProductInput,
  type ImportedProduct,
} from "../contracts/product-sourcing.contract";

/** GET /api/v2/suppliers/:supplierId/search */
export async function searchSupplierProducts(
  supplierId: string,
  query: string,
  limit = 10,
): Promise<SupplierSearchResult[]> {
  const qs = new URLSearchParams({ q: query, limit: String(limit) });
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
