/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "suppliers",
  dependsOn: [] as const,
  exposes: ["SupplierGrid", "useSuppliers"] as const,
} as const;

export type SuppliersManifest = typeof featureManifest;
