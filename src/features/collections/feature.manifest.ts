/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "collections",
  dependsOn: [] as const,
  exposes: ["CollectionGrid", "useCollections"] as const,
} as const;

export type CollectionsManifest = typeof featureManifest;
