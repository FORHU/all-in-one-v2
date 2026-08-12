/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "inventory",
  dependsOn: [] as const,
  exposes: [
    "LocationsListView",
    "LocationDetailView",
    "StockLookupView",
    "TransactionsListView",
    "useLocations",
    "useVariantStock",
    "useTransactions",
  ] as const,
} as const;

export type InventoryManifest = typeof featureManifest;
