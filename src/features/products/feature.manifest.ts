/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "products",
  dependsOn: [] as const,
  exposes: [
    "ProductsTable",
    "ProductsStatsBar",
    "BrandGrid",
    "ProductFormModal",
    "useCreateProduct",
    "useUpdateProduct",
    "useDeleteProduct",
  ] as const,
} as const;

export type ProductsManifest = typeof featureManifest;
