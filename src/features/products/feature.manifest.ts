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
    "CategoryGrid",
    "BrandGrid",
    "CollectionGrid",
  ] as const,
} as const;

export type ProductsManifest = typeof featureManifest;
