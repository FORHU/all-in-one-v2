/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "categories",
  dependsOn: [] as const,
  exposes: [
    "CategoryGrid",
    "CategoryDetailView",
    "useCategories",
    "useCategory",
    "useCreateCategory",
    "useUpdateCategory",
    "useDeleteCategory",
  ] as const,
} as const;

export type CategoriesManifest = typeof featureManifest;
