/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "orders",
  dependsOn: [] as const,
  exposes: [
    "OrdersTable",
    "useOrders",
    "OrderDetailView",
    "OrdersListView",
  ] as const,
} as const;

export type OrdersManifest = typeof featureManifest;
