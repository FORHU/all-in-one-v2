/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "auth",
  dependsOn: [] as const,
  exposes: [
    "Can",
    "usePermissions",
    "useAuthStore",
    "LoginForm",
    "RegisterForm",
  ] as const,
} as const;

export type AuthManifest = typeof featureManifest;
